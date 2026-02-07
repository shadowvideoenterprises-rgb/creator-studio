'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Save, RotateCw, CheckCircle, AlertCircle, Server, Cpu } from 'lucide-react'
import { useToast } from '@/components/ToastProvider'

export default function SettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [settings, setSettings] = useState<any>({})
  const [availableModels, setAvailableModels] = useState<any>(null)

  useEffect(() => { fetchSettings() }, [])

  const fetchSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase.from('user_settings').select('*').eq('user_id', user.id).single()
    if (data) {
        setSettings(data)
        setAvailableModels(data.available_models || { google: [], openai: [] })
    }
    setLoading(false)
  }

  const handleScanModels = async () => {
    setScanning(true)
    toast("Scanning API capabilities...", "loading")
    
    try {
        const { data: { user } } = await supabase.auth.getUser()
        const res = await fetch('/api/models/discover', { 
            method: 'POST',
            body: JSON.stringify({ userId: user?.id })
        })
        const data = await res.json()
        
        if (data.success) {
            setAvailableModels(data.models)
            toast(`Found ${data.models.google.length} Google models`, "success")
        } else {
            toast("Scan failed: " + data.error, "error")
        }
    } catch (e) {
        toast("Network error during scan", "error")
    } finally {
        setScanning(false)
    }
  }

  const saveSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('user_settings').upsert({ 
        user_id: user?.id,
        ...settings
    })
    if (error) toast("Failed to save", "error")
    else toast("Settings saved", "success")
  }

  if (loading) return <div className="p-12 text-slate-500">Loading settings...</div>

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-black text-white mb-8">Studio Settings</h1>

      {/* API Keys Section */}
      <div className="bg-[#121214] border border-white/5 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2"><Server size={18}/> API Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Google Gemini Key</label>
                <input 
                    type="password" 
                    value={settings.api_keys?.google || ''}
                    onChange={(e) => setSettings({...settings, api_keys: {...settings.api_keys, google: e.target.value}})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white mt-2"
                    placeholder="AIzaSy..."
                />
            </div>
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase">OpenAI Key</label>
                <input 
                    type="password" 
                    value={settings.api_keys?.openai || ''}
                    onChange={(e) => setSettings({...settings, api_keys: {...settings.api_keys, openai: e.target.value}})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white mt-2"
                    placeholder="sk-proj..."
                />
            </div>
        </div>
        
        <div className="flex justify-end pt-4">
            <button onClick={saveSettings} className="px-6 py-2 bg-white text-black font-bold rounded-lg flex items-center gap-2 hover:bg-slate-200">
                <Save size={16} /> Save Keys
            </button>
        </div>
      </div>

      {/* Model Discovery Section */}
      <div className="bg-[#121214] border border-white/5 rounded-2xl p-6 space-y-6">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2"><Cpu size={18}/> Model Discovery</h2>
                <p className="text-slate-500 text-sm mt-1">Scan your keys to auto-detect available AI models.</p>
            </div>
            <button 
                onClick={handleScanModels}
                disabled={scanning}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-2 disabled:opacity-50 transition-all"
            >
                <RotateCw size={16} className={scanning ? "animate-spin" : ""} />
                {scanning ? "Scanning..." : "Scan Now"}
            </button>
        </div>

        {availableModels?.google?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
                {availableModels.google.map((m: any) => (
                    <div key={m.id} className="p-3 bg-white/5 rounded-lg border border-white/5 flex justify-between items-center">
                        <div>
                            <div className="font-bold text-sm text-slate-200">{m.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{m.id}</div>
                        </div>
                        <span className="px-2 py-1 bg-green-500/10 text-green-400 text-[10px] font-bold rounded uppercase">{m.type}</span>
                    </div>
                ))}
            </div>
        ) : (
            <div className="p-8 border border-dashed border-white/10 rounded-xl text-center text-slate-500">
                <AlertCircle className="mx-auto mb-2 opacity-50" />
                No models detected yet. Add keys and hit Scan.
            </div>
        )}
      </div>
    </div>
  )
}
