export type ProviderType = 'gemini' | 'openai' | 'claude' | 'replicate' | 'dalle3' | 'midjourney';
export type ExportFormat = 'video_full' | 'capcut_chunks' | 'xml_premiere';

export interface UserSettings {
  user_id: string;
  
  // Service Adapters
  default_script_provider: ProviderType;
  default_image_provider: ProviderType;
  
  // Workflow
  stock_enabled: boolean;
  export_preference: ExportFormat;
  
  // Keys (Optional on client for security, mostly used in API)
  openai_key?: string;
  elevenlabs_key?: string;
  replicate_key?: string;
  anthropic_key?: string;

  // Simple DNA
  brand_voice_description?: string;
  brand_visual_style?: string;
  
  updated_at: string;
}

export interface ChannelProfile {
  id: string;
  user_id: string;
  name: string;
  target_audience?: string;
  voice_tone?: string;
  visual_style_prompt?: string;
  music_genre?: string;
  is_active: boolean;
  created_at: string;
}
