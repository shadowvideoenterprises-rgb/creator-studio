'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { 
  Palette, Save, Plus, Trash2, 
  MonitorPlay, Smartphone, Type, 
  Music, Sparkles, Check
} from 'lucide-react'

// --- TYPES ---
interface BrandProfile {
  id: string;
  name: string;
  target_audience: string;
  voice_tone: string;
  visual_style_prompt: string;
  default_aspect_ratio: '16:9' | '9:16';
  is_active: boolean;
}

export default function BrandPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profiles, setProfiles] = useState<BrandProfile[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  
  const activeProfile = profiles.find(p => p.id === selectedId) || null

  useEffect(() => { fetchProfiles() }, [])

  const fetchProfiles = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
        .from('channel_profiles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

    if (data && data.length > 0) {
        setProfiles(data as any)
        setSelectedId(data[0].id)
    } else {
        setProfiles([]) 
    }
    setLoading(false)
  }

  const createNewProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const newProfile = {
          user_id: user.id,
          name: "New Channel",
          target_audience: "General Audience",
          voice_tone: "Professional but engaging",
          visual_style_prompt: "Cinematic lighting, 4k, photorealistic",
          default_aspect_ratio: "16:9",
          is_active: true
      }

      const { data, error } = await supabase.from('channel_profiles').insert([newProfile]).select().single()
      
      if (data) {
          setProfiles(prev => [...prev, data as any])
          setSelectedId(data.id)
      }
  }

  const updateLocalProfile = (key: keyof BrandProfile, value: any) => {
      if (!selectedId) return
      setProfiles(prev => prev.map(p => p.id === selectedId ? { ...p, [key]: value } : p))
  }

  const saveChanges = async () => {
      if (!activeProfile) return
      setSaving(true)
      
      const { error } = await supabase
          .from('channel_profiles')
          .update({
              name: activeProfile.name,
              target_audience: activeProfile.target_audience,
              voice_tone: activeProfile.voice_tone,
              visual_style_prompt: activeProfile.visual_style_prompt,
              default_aspect_ratio: activeProfile.default_aspect_ratio
          })
          .eq('id', activeProfile.id)

      setSaving(false)
      if (error) alert("Error saving DNA")
      else alert("DNA Updated Successfully 🧬")
  }

  const deleteProfile = async (id: string) => {
      if (!confirm("Delete this brand profile?")) return
      await supabase.from('channel_profiles').delete().eq('id', id)
      setProfiles(prev => prev.filter(p => p.id !== id))
      if (selectedId === id) setSelectedId(null)
  }

  if (loading) return <div className="p-20 text-center text-slate-500 animate-pulse">Loading DNA...</div>

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen pb-20 relative font-sans">
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-white/5 pb-8 mb-8">
        <div>
           <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Channel DNA</h1>
           <p className="text-slate-400 text-lg">Define the soul of your content. AI uses this to mimic your style.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* SIDEBAR: BRAND LIST */}
          <div className="lg:col-span-3 space-y-4">
              <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">My Brands</h3>
                  <button onClick={createNewProfile} className="text-purple-400 hover:text-white"><Plus size={18}/></button>
              </div>
              
              <div className="space-y-2">
                  {profiles.map(profile => (
                      <button 
                        key={profile.id}
                        onClick={() => setSelectedId(profile.id)}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group ${selectedId === profile.id ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/50' : 'bg-[#121214] border-white/5 text-slate-400 hover:border-white/20 hover:text-white'}`}
                      >
                          <span className="font-bold truncate">{profile.name}</span>
                          {selectedId === profile.id && <Sparkles size={14} className="text-purple-200" />}
                      </button>
                  ))}
                  
                  {profiles.length === 0 && (
                      <button onClick={createNewProfile} className="w-full p-8 rounded-xl border-2 border-dashed border-white/10 text-slate-500 hover:border-purple-500/50 hover:text-purple-400 transition-all flex flex-col items-center gap-2">
                          <Plus size={24} />
                          <span className="text-sm font-bold">Create First Brand</span>
                      </button>
                  )}
              </div>
          </div>

          {/* EDITOR AREA */}
          <div className="lg:col-span-9">
              {activeProfile ? (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                      
                      {/* TOP BAR */}
                      <div className="flex justify-between items-center bg-[#121214] p-4 rounded-2xl border border-white/5">
                          <input 
                            value={activeProfile.name}
                            onChange={(e) => updateLocalProfile('name', e.target.value)}
                            className="bg-transparent text-2xl font-black text-white focus:outline-none placeholder-slate-700 w-full"
                            placeholder="Brand Name..."
                          />
                          <div className="flex gap-2">
                              <button onClick={() => deleteProfile(activeProfile.id)} className="p-3 hover:bg-red-500/10 text-slate-600 hover:text-red-500 rounded-xl transition-all"><Trash2 size={18} /></button>
                              <button onClick={saveChanges} disabled={saving} className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-purple-300 transition-all flex items-center gap-2">
                                  {saving ? <span className="animate-spin">⏳</span> : <Save size={18} />} <span>Save DNA</span>
                              </button>
                          </div>
                      </div>

                      {/* 1. FORMAT & IDENTITY */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="bg-[#121214] border border-white/5 p-6 rounded-3xl space-y-4">
                               <div className="flex items-center gap-2 text-pink-400 mb-2">
                                   <MonitorPlay size={20} />
                                   <h3 className="font-bold text-white">Platform Format</h3>
                               </div>
                               <div className="flex gap-2">
                                   <button 
                                      onClick={() => updateLocalProfile('default_aspect_ratio', '16:9')}
                                      className={`flex-1 p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${activeProfile.default_aspect_ratio === '16:9' ? 'bg-pink-500/10 border-pink-500 text-pink-400' : 'bg-black/20 border-white/5 text-slate-500 hover:border-white/20'}`}
                                   >
                                       <div className="w-12 h-7 border-2 border-current rounded-sm" />
                                       <span className="text-xs font-bold">YouTube (16:9)</span>
                                   </button>
                                   <button 
                                      onClick={() => updateLocalProfile('default_aspect_ratio', '9:16')}
                                      className={`flex-1 p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${activeProfile.default_aspect_ratio === '9:16' ? 'bg-pink-500/10 border-pink-500 text-pink-400' : 'bg-black/20 border-white/5 text-slate-500 hover:border-white/20'}`}
                                   >
                                       <div className="w-7 h-12 border-2 border-current rounded-sm" />
                                       <span className="text-xs font-bold">TikTok (9:16)</span>
                                   </button>
                               </div>
                           </div>

                           <div className="bg-[#121214] border border-white/5 p-6 rounded-3xl space-y-4">
                               <div className="flex items-center gap-2 text-blue-400 mb-2">
                                   <Type size={20} />
                                   <h3 className="font-bold text-white">Target Audience</h3>
                               </div>
                               <textarea 
                                  value={activeProfile.target_audience || ''}
                                  onChange={(e) => updateLocalProfile('target_audience', e.target.value)}
                                  placeholder="e.g. Busy professionals aged 25-40 who want quick finance tips..."
                                  className="w-full h-24 bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-blue-500/50 outline-none resize-none"
                               />
                           </div>
                      </div>

                      {/* 2. VOICE & TONE */}
                      <div className="bg-[#121214] border border-white/5 p-8 rounded-3xl space-y-4">
                           <div className="flex justify-between items-center">
                               <div className="flex items-center gap-2 text-emerald-400">
                                   <Music size={20} />
                                   <h3 className="font-bold text-white text-lg">Voice & Personality</h3>
                               </div>
                               <span className="text-xs font-mono text-slate-500">Injects into: Script Engine</span>
                           </div>
                           <p className="text-sm text-slate-400">Describe exactly how the AI should write. Use adjectives like "Sarcastic," "Academic," "Hype-beast," or "Storyteller."</p>
                           <textarea 
                              value={activeProfile.voice_tone || ''}
                              onChange={(e) => updateLocalProfile('voice_tone', e.target.value)}
                              placeholder="e.g. The script should sound like a mystery novel narrator. Use short sentences. Be dramatic. Avoid corporate jargon."
                              className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-emerald-500/50 outline-none resize-none font-mono"
                           />
                      </div>

                      {/* 3. VISUAL STYLE */}
                      <div className="bg-[#121214] border border-white/5 p-8 rounded-3xl space-y-4">
                           <div className="flex justify-between items-center">
                               <div className="flex items-center gap-2 text-purple-400">
                                   <Palette size={20} />
                                   <h3 className="font-bold text-white text-lg">Visual Aesthetic</h3>
                               </div>
                               <span className="text-xs font-mono text-slate-500">Injects into: Image Gen (Midjourney/Flux)</span>
                           </div>
                           <p className="text-sm text-slate-400">These keywords are appended to every image prompt. Define your color palette, lighting, and medium.</p>
                           <textarea 
                              value={activeProfile.visual_style_prompt || ''}
                              onChange={(e) => updateLocalProfile('visual_style_prompt', e.target.value)}
                              placeholder="e.g. 80s synthwave style, neon purple and blue lighting, cyberpunk city background, digital art, high contrast..."
                              className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-purple-500/50 outline-none resize-none font-mono"
                           />
                      </div>

                  </div>
              ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4 opacity-50">
                      <Sparkles size={48} />
                      <p>Select or Create a Brand Profile to begin.</p>
                  </div>
              )}
          </div>
      </div>
    </div>
  )
}
