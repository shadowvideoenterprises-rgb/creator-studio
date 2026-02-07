'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Save, RotateCw, AlertCircle, Server, Cpu, DollarSign, TrendingUp } from 'lucide-react'
import { useToast } from '@/components/ToastProvider'

export default function SettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [settings, setSettings] = useState<any>({})
  const [availableModels, setAvailableModels] = useState<any>(null)
  
  // New State: Usage Stats
  const [usage, setUsage] = useState({ total_spend: 0, project_count: 0 })

  useEffect(() => { fetchSettings() }, [])

  const fetchSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Fetch Settings
    const { data } = await supabase.from('user_settings').select('*').eq('user_id', user.id).single()
    if (data) {
        setSettings(data)
        setAvailableModels(data.available_models || { google: [], openai: [] })
    }

    // Fetch Usage (Simple Aggregation)
    const { data: logs } = await supabase.from('usage_logs').select('cost').eq('user_id', user.id)
    const total = logs?.reduce((acc, log) => acc + (log.cost || 0), 0) || 0
    
    const { count } = await supabase.from('projects').select('*', { count: 'exact' }).eq('user_id', user.id)

    setUsage({ total_spend: total, project_count: count || 0 })
    setLoading(false)
  }

  const handleScanModels = async () => {
    setScanning(true)
    try {
        const { data: { user } } = await supabase.auth.getUser()
        const res = await fetch('/api/models/discover', { 
            method: 'POST', 
            body: JSON.stringify({ userId: user?.id }) 
        })
        const data = await res.json()
        if (data.success) {
            setAvailableModels(data.models)
            toast("Models Updated", "success")
        }
    } catch (e) { toast("Scan Failed", "error") }
    setScanning(false)
  }

  const saveSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('user_settings').upsert({ user_id: user?.id, ...settings })
    if (error) toast("Failed to save", "error")
    else toast("Settings saved", "success")
  }

  if (loading) return <div className="p-12 text-slate-500">Loading settings...</div>

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in">
      <h1 className="text-3xl font-black text-white mb-8">Studio Command Center</h1>

      {/* NEW: Usage Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-900/40 to-emerald-900/10 border border-emerald-500/20 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-2 text-emerald-400 font-bold text-xs uppercase tracking-widest">
                <DollarSign size={16} /> Total Spend
            </div>
            <div className="text-4xl font-black text-white">${usage.total_spend.toFixed(4)}</div>
            <div className="text-xs text-slate-400 mt-2">Estimated API Cost</div>
        </div>
        
        <div className="bg-[#121214] border border-white/5 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-2 text-blue-400 font-bold text-xs uppercase tracking-widest">
                <TrendingUp size={16} /> Projects Created
            </div>
            <div className="text-4xl font-black text-white">{usage.project_count}</div>
        </div>

        <div className="bg-[#121214] border border-white/5 p-6 rounded-2xl flex flex-col justify-center items-start">
             <button className="text-xs font-bold bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-slate-300 transition-colors">
                View Detailed Logs &rarr;
             </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* API Keys */}
          <div className="bg-[#121214] border border-white/5 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2"><Server size={18}/> API Configuration</h2>
            <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Google Gemini Key</label>
                    <input type="password" value={settings.api_keys?.google || ''} onChange={(e) => setSettings({...settings, api_keys: {...settings.api_keys, google: e.target.value}})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white mt-2" placeholder="AIzaSy..." />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">OpenAI Key</label>
                    <input type="password" value={settings.api_keys?.openai || ''} onChange={(e) => setSettings({...settings, api_keys: {...settings.api_keys, openai: e.target.value}})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white mt-2" placeholder="sk-proj..." />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">ElevenLabs Key</label>
                    <input type="password" value={settings.api_keys?.elevenlabs || ''} onChange={(e) => setSettings({...settings, api_keys: {...settings.api_keys, elevenlabs: e.target.value}})} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white mt-2" placeholder="xi..." />
                </div>
            </div>
            <div className="flex justify-end pt-4"><button onClick={saveSettings} className="px-6 py-2 bg-white text-black font-bold rounded-lg flex items-center gap-2 hover:bg-slate-200"><Save size={16} /> Save Keys</button></div>
          </div>

          {/* Model Discovery */}
          <div className="bg-[#121214] border border-white/5 rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div><h2 className="text-lg font-bold text-white flex items-center gap-2"><Cpu size={18}/> Model Discovery</h2></div>
                <button onClick={handleScanModels} disabled={scanning} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-2 disabled:opacity-50 transition-all"><RotateCw size={16} className={scanning ? "animate-spin" : ""} /> {scanning ? "Scanning..." : "Scan Now"}</button>
            </div>
            {availableModels?.google?.length > 0 ? (
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                    {availableModels.google.map((m: any) => (
                        <div key={m.id} className="p-3 bg-white/5 rounded-lg border border-white/5 flex justify-between items-center">
                            <div><div className="font-bold text-sm text-slate-200">{m.name}</div><div className="text-[10px] text-slate-500 font-mono">{m.id}</div></div>
                            <span className="px-2 py-1 bg-green-500/10 text-green-400 text-[10px] font-bold rounded uppercase">{m.type}</span>
                        </div>
                    ))}
                </div>
            ) : (<div className="p-8 border border-dashed border-white/10 rounded-xl text-center text-slate-500"><AlertCircle className="mx-auto mb-2 opacity-50" /> No models detected yet.</div>)}
          </div>
      </div>
    </div>
  )
}
