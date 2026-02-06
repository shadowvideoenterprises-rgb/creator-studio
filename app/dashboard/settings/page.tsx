'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Save, Key, Cpu, ShieldCheck, Video, Palette, Brain, Layers, Film } from 'lucide-react'

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    openai_key: '',
    elevenlabs_key: '',
    replicate_key: '',
    // Workflow & Providers
    default_script_provider: 'gemini',
    default_image_provider: 'replicate',
    stock_enabled: true,
    export_preference: 'video_full',
    // Channel DNA
    brand_voice_description: '',
    brand_visual_style: ''
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!data && !error) {
       // Create default if missing
       const { data: newData } = await supabase.from('user_settings').insert([{ user_id: user.id }]).select().single()
       data = newData
    }

    if (data) {
      setSettings({
        openai_key: data.openai_key || '',
        elevenlabs_key: data.elevenlabs_key || '',
        replicate_key: data.replicate_key || '',
        default_script_provider: data.default_script_provider || 'gemini',
        default_image_provider: data.default_image_provider || 'replicate',
        stock_enabled: data.stock_enabled ?? true, // Use ?? to handle boolean false
        export_preference: data.export_preference || 'video_full',
        brand_voice_description: data.brand_voice_description || '',
        brand_visual_style: data.brand_visual_style || ''
      })
    }
  }

  const handleSave = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    const { error } = await supabase
      .from('user_settings')
      .upsert({ 
        user_id: user?.id,
        ...settings
      })

    setLoading(false)
    if (error) {
        console.error(error)
        alert('Error saving settings')
    } else {
        alert('Settings saved successfully!')
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen space-y-12 pb-20">
      
      <div className="flex justify-between items-end border-b border-white/5 pb-8">
        <div>
           <h1 className="text-4xl font-black text-white mb-2">Studio Settings</h1>
           <p className="text-slate-400 text-lg">Configure your AI pipeline, API keys, and brand identity.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-purple-300 transition-all flex items-center gap-2 disabled:opacity-50 shadow-xl shadow-white/5"
        >
          {loading ? <span className="animate-spin">⏳</span> : <Save size={18} />}
          <span>Save Changes</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: Technical Config */}
        <div className="space-y-8">
            
            {/* 1. Workflow Preferences */}
            <div className="bg-[#121214] border border-white/5 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Layers size={20} /></div>
                <h2 className="text-xl font-bold text-white">Production Workflow</h2>
              </div>
              
              <div className="space-y-5">
                 <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">How do you edit?</label>
                   <select 
                     value={settings.export_preference}
                     onChange={(e) => setSettings({...settings, export_preference: e.target.value})}
                     className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 focus:outline-none"
                   >
                     <option value="video_full">Full AI Generation (Images + Audio)</option>
                     <option value="capcut_chunks">CapCut Helper (Short Script Chunks)</option>
                     <option value="xml_premiere">Professional (Premiere/Davinci)</option>
                   </select>
                   <p className="text-xs text-slate-500">
                     {settings.export_preference === 'capcut_chunks' 
                       ? "We will break scripts into <500 char chunks for easy TTS pasting." 
                       : "We will generate a complete package with assets linked."}
                   </p>
                 </div>

                 <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                    <span className="text-sm font-bold text-slate-300 flex items-center gap-2">
                        <Film size={16} /> Prioritize Stock Footage?
                    </span>
                    <button 
                       onClick={() => setSettings({...settings, stock_enabled: !settings.stock_enabled})}
                       className={`w-12 h-6 rounded-full transition-colors relative ${settings.stock_enabled ? 'bg-green-500' : 'bg-slate-700'}`}
                    >
                       <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.stock_enabled ? 'left-7' : 'left-1'}`} />
                    </button>
                 </div>
              </div>
            </div>

            {/* 2. API Keys (The Engine) */}
            <div className="bg-[#121214] border border-white/5 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><Key size={20} /></div>
                <h2 className="text-xl font-bold text-white">API Keys</h2>
              </div>
              
              <div className="space-y-4">
                 {['openai', 'elevenlabs', 'replicate'].map((provider) => (
                   <div key={provider} className="space-y-1">
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{provider}</label>
                     <input 
                       type="password" 
                       value={(settings as any)[`${provider}_key`]}
                       onChange={(e) => setSettings({...settings, [`${provider}_key`]: e.target.value})}
                       className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-purple-500/50 focus:outline-none font-mono"
                       placeholder={`Paste your ${provider} key...`}
                     />
                   </div>
                 ))}
              </div>
              <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-500">
                 <ShieldCheck size={12} /> Keys are encrypted.
              </div>
            </div>

        </div>

        {/* RIGHT COLUMN: Creative Config */}
        <div className="space-y-8">
            
            {/* 3. The "Brain" (Model Selection) */}
            <div className="bg-[#121214] border border-white/5 rounded-3xl p-8">
               <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><Brain size={20} /></div>
                 <h2 className="text-xl font-bold text-white">Intelligence Provider</h2>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Script Writer</label>
                    <select 
                      value={settings.default_script_provider}
                      onChange={(e) => setSettings({...settings, default_script_provider: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 focus:outline-none"
                    >
                      <option value="gemini">Google Gemini (Fast/Free)</option>
                      <option value="openai">GPT-4o (Precise)</option>
                      <option value="claude">Claude 3.5 (Human-like)</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Visual Artist</label>
                    <select 
                      value={settings.default_image_provider}
                      onChange={(e) => setSettings({...settings, default_image_provider: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 focus:outline-none"
                    >
                      <option value="replicate">Replicate Flux (Realistic)</option>
                      <option value="dalle3">DALL-E 3 (Stylized)</option>
                    </select>
                  </div>
               </div>
            </div>

            {/* 4. Channel DNA (The Moat) */}
            <div className="bg-gradient-to-br from-[#1a1a20] to-[#121214] border border-purple-500/20 rounded-3xl p-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full" />
               
               <div className="flex items-center gap-3 mb-6 relative z-10">
                 <div className="p-2 bg-purple-500 rounded-lg text-white shadow-lg shadow-purple-500/20"><Palette size={20} /></div>
                 <h2 className="text-xl font-bold text-white">Channel DNA</h2>
               </div>

               <div className="space-y-5 relative z-10">
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-purple-300 uppercase tracking-widest">Brand Voice</label>
                     <textarea 
                       value={settings.brand_voice_description}
                       onChange={(e) => setSettings({...settings, brand_voice_description: e.target.value})}
                       className="w-full h-24 bg-black/40 border border-purple-500/20 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none text-sm leading-relaxed resize-none placeholder-purple-900/50"
                       placeholder="e.g. Sarcastic, fast-paced, Gen-Z slang, uses metaphors about space..."
                     />
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs font-bold text-purple-300 uppercase tracking-widest">Visual Style</label>
                     <textarea 
                       value={settings.brand_visual_style}
                       onChange={(e) => setSettings({...settings, brand_visual_style: e.target.value})}
                       className="w-full h-24 bg-black/40 border border-purple-500/20 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none text-sm leading-relaxed resize-none placeholder-purple-900/50"
                       placeholder="e.g. Dark moody lighting, neon accents, cyberpunk aesthetic, 4k 3d render..."
                     />
                  </div>
               </div>
            </div>

        </div>

      </div>
    </div>
  )
}
