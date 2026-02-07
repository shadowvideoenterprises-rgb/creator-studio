'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Save, Key, ArrowRight } from 'lucide-react'
import { useToast } from '@/components/ToastProvider'
import Link from 'next/link'

export default function SettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<any>({})

  useEffect(() => { fetchSettings() }, [])

  const fetchSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('user_settings').select('api_keys').eq('user_id', user.id).single()
    if (data) setSettings(data)
    setLoading(false)
  }

  const saveSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('user_settings').upsert({ 
        user_id: user?.id, 
        ...settings 
    })
    if (error) toast("Failed to save", "error")
    else toast("API Keys Saved", "success")
  }

  if (loading) return <div className="p-12 text-slate-500">Loading settings...</div>

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8 animate-in fade-in">
      <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black text-white">Settings</h1>
          <Link href="/dashboard/dna" className="text-indigo-400 hover:text-white flex items-center gap-1 font-bold">
            Go to Identity Lab <ArrowRight size={16} />
          </Link>
      </div>

      <div className="bg-[#121214] border border-white/5 rounded-2xl p-8 space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Key size={20} className="text-slate-400"/> API Configuration
        </h2>
        <p className="text-slate-400 text-sm">
            Your keys are stored securely and used only for your generations.
        </p>
        
        <div className="space-y-6">
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Google Gemini Key</label>
                <input 
                    type="password" 
                    value={settings.api_keys?.google || ''} 
                    onChange={(e) => setSettings({...settings, api_keys: {...settings.api_keys, google: e.target.value}})} 
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-mono focus:border-indigo-500 outline-none transition-colors"
                    placeholder="AIza..." 
                />
            </div>
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">ElevenLabs Key</label>
                <input 
                    type="password" 
                    value={settings.api_keys?.elevenlabs || ''} 
                    onChange={(e) => setSettings({...settings, api_keys: {...settings.api_keys, elevenlabs: e.target.value}})} 
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-mono focus:border-indigo-500 outline-none transition-colors"
                    placeholder="sk_..."
                />
            </div>
        </div>
        
        <div className="pt-4 border-t border-white/5 flex justify-end">
            <button onClick={saveSettings} className="px-8 py-3 bg-white text-black font-bold rounded-xl flex items-center gap-2 hover:bg-slate-200 transition-colors">
                <Save size={18} /> Save Keys
            </button>
        </div>
      </div>
    </div>
  )
}
