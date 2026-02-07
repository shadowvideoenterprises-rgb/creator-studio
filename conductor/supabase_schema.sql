-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. USER SETTINGS (The Service Adapter Engine)
-- Stores API keys and global workflow preferences
-- ==========================================
create table if not exists public.user_settings (
  user_id uuid references auth.users not null primary key,
  
  -- Service Adapter Factory (Phase 1.1)
  -- Allows switching engines without code changes
  default_script_provider text default 'gemini', -- 'gemini', 'openai', 'claude'
  default_image_provider text default 'replicate', -- 'replicate', 'dalle3', 'midjourney'
  
  -- Workflow Preferences
  stock_enabled boolean default true,
  export_preference text default 'video_full', -- 'video_full', 'capcut_chunks', 'xml_premiere'
  
  -- Secure Key Storage (Note: For MVP these are text. In Prod, use Supabase Vault)
  openai_key text,
  elevenlabs_key text,
  replicate_key text,
  anthropic_key text,
  
  -- Legacy / Quick DNA (Supports current Settings UI)
  brand_voice_description text,
  brand_visual_style text,
  
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 2. CHANNEL PROFILES (Phase 3.1 Channel DNA)
-- Allows multiple "Brands" per user (e.g. "History Channel" vs "Gaming Channel")
-- ==========================================
create table if not exists public.channel_profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  
  name text not null, -- e.g., "Main Channel"
  
  -- The "DNA" Variables
  target_audience text,
  voice_tone text, -- "Sarcastic", "Professional"
  visual_style_prompt text, -- The "Midjourney" suffix
  music_genre text,
  
  is_active boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 3. SECURITY POLICIES (RLS)
-- ==========================================
alter table public.user_settings enable row level security;
alter table public.channel_profiles enable row level security;

-- Policies for user_settings
create policy "Users can view own settings" 
  on public.user_settings for select 
  using (auth.uid() = user_id);

create policy "Users can update own settings" 
  on public.user_settings for update 
  using (auth.uid() = user_id);

create policy "Users can insert own settings" 
  on public.user_settings for insert 
  with check (auth.uid() = user_id);

-- Policies for channel_profiles
create policy "Users can view own profiles" 
  on public.channel_profiles for select 
  using (auth.uid() = user_id);

create policy "Users can manage own profiles" 
  on public.channel_profiles for all 
  using (auth.uid() = user_id);

-- ==========================================
-- 4. AUTO-PROVISIONING
-- Automatically create a settings row when a user signs up
-- ==========================================
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.user_settings (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function on sign up
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
