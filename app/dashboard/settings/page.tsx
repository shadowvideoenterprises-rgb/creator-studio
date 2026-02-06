'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Save, Key, User, Cpu, ShieldCheck } from 'lucide-react'

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    openai_key: '',
    elevenlabs_key: '',
    replicate_key: '',
    default_model: 'gpt-4o'
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Try to fetch existing settings
    let { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // If no settings exist yet, create a default row
    if (!data) {
       const { data: newData } = await supabase
        .from('user_settings')
        .insert([{ user_id: user.id }])
        .select()
        .single()
       data = newData
    }

    if (data) {
      // Mask keys for security (UI only)
      setSettings({
        openai_key: data.openai_key || '',
        elevenlabs_key: data.elevenlabs_key || '',
        replicate_key: data.replicate_key || '',
        default_model: data.default_model || 'gpt-4o'
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
    if (error) alert('Error saving settings')
    else alert('Settings saved successfully!')
  }

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen">
      
      <div className="mb-10">
        <h1 className="text-3xl font-black text-white mb-2">Settings</h1>
        <p className="text-slate-400">Manage your API keys and default AI configurations.</p>
      </div>

      <div className="space-y-8">
        
        {/* API Keys Section */}
        <div className="bg-[#121214] border border-white/5 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
              <Key size={20} />
            </div>
            <h2 className="text-xl font-bold text-white">Your API Keys</h2>
          </div>
          
          <div className="space-y-5">
             <div className="space-y-2">
               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">OpenAI Key (Scripting)</label>
               <input 
                 type="password" 
                 value={settings.openai_key}
                 onChange={(e) => setSettings({...settings, openai_key: e.target.value})}
                 placeholder="sk-..."
                 className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 focus:outline-none font-mono text-sm"
               />
             </div>

             <div className="space-y-2">
               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">ElevenLabs Key (Voice)</label>
               <input 
                 type="password" 
                 value={settings.elevenlabs_key}
                 onChange={(e) => setSettings({...settings, elevenlabs_key: e.target.value})}
                 placeholder="xi-..."
                 className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 focus:outline-none font-mono text-sm"
               />
             </div>

             <div className="space-y-2">
               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Replicate Key (Visuals)</label>
               <input 
                 type="password" 
                 value={settings.replicate_key}
                 onChange={(e) => setSettings({...settings, replicate_key: e.target.value})}
                 placeholder="r8_..."
                 className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 focus:outline-none font-mono text-sm"
               />
             </div>
          </div>

          <div className="mt-6 flex items-center gap-2 text-xs text-slate-500 bg-blue-500/5 p-3 rounded-lg border border-blue-500/10">
             <ShieldCheck size={14} className="text-blue-400" />
             <span>Keys are encrypted at rest. We never share them.</span>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-[#121214] border border-white/5 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Cpu size={20} />
            </div>
            <h2 className="text-xl font-bold text-white">Default Model Config</h2>
          </div>

          <div className="grid grid-cols-2 gap-6">
             <div className="space-y-2">
               <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Script Model</label>
               <select 
                 value={settings.default_model}
                 onChange={(e) => setSettings({...settings, default_model: e.target.value})}
                 className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 focus:outline-none text-sm"
               >
                 <option value="gpt-4o">GPT-4o (Best Quality)</option>
                 <option value="gpt-4-turbo">GPT-4 Turbo</option>
                 <option value="gpt-3.5-turbo">GPT-3.5 (Fastest)</option>
               </select>
             </div>
          </div>
        </div>

        {/* Save Action */}
        <div className="flex justify-end pt-4">
          <button 
            onClick={handleSave}
            disabled={loading}
            className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-purple-300 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <span className="animate-spin">⏳</span> : <Save size={18} />}
            <span>Save Changes</span>
          </button>
        </div>

      </div>
    </div>
  )
}
