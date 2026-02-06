'use client'
import { useState, useEffect } from 'react'
import { Save, Key, ShieldCheck, CheckCircle2, XCircle, Loader2, Zap, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
  const [keys, setKeys] = useState({ openai: '', gemini: '' })
  const [models, setModels] = useState<any[]>([])
  const [selectedModel, setSelectedModel] = useState('mock-free')
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')

  useEffect(() => {
    const savedKeys = localStorage.getItem('user_api_keys')
    const savedModel = localStorage.getItem('user_selected_model')
    
    if (savedKeys) setKeys(JSON.parse(savedKeys))
    if (savedModel) setSelectedModel(savedModel)
  }, [])

  const handleTestAndSave = async () => {
    setStatus('testing')
    try {
      const res = await fetch('/api/settings/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(keys)
      })
      const data = await res.json()

      if (data.success) {
        setModels(data.models)
        localStorage.setItem('user_api_keys', JSON.stringify(keys))
        
        const validIds = data.models.map((m: any) => m.id)
        if (!validIds.includes(selectedModel)) {
           const best = validIds.find((id: string) => id !== 'mock-free') || 'mock-free'
           setSelectedModel(best)
           localStorage.setItem('user_selected_model', best)
        } else {
           localStorage.setItem('user_selected_model', selectedModel)
        }
        setStatus('success')
      } else { setStatus('error') }
    } catch (e) { setStatus('error') }
  }

  const handleModelSelect = (id: string) => {
    setSelectedModel(id)
    localStorage.setItem('user_selected_model', id)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* NEW: Back Button */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition mb-4">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
             <SettingsIcon size={28} /> AI Configuration
          </h1>
          <p className="text-slate-500">Manage your API keys and choose your generation engine.</p>
        </div>

        <div className="bg-[#121214] border border-white/5 rounded-2xl p-8 space-y-8">
           {/* (Same form content as before...) */}
           <div className="space-y-6">
             <h3 className="text-lg font-bold text-white border-b border-white/5 pb-4">1. Provide Credentials</h3>
             <div className="space-y-2">
               <label className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                 <span className="flex items-center gap-2"><Key size={12} /> OpenAI API Key</span>
                 {models.some(m => m.provider === 'openai') && <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 size={12}/> Verified</span>}
               </label>
               <input type="password" value={keys.openai} onChange={(e) => setKeys({...keys, openai: e.target.value})} placeholder="sk-..." className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-purple-500 transition font-mono text-sm" />
             </div>
             <div className="space-y-2">
               <label className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                 <span className="flex items-center gap-2"><Key size={12} /> Google Gemini Key</span>
                 {models.some(m => m.provider === 'google') && <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 size={12}/> Verified</span>}
               </label>
               <input type="password" value={keys.gemini} onChange={(e) => setKeys({...keys, gemini: e.target.value})} placeholder="AIza..." className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-blue-500 transition font-mono text-sm" />
             </div>
          </div>

          <div className="flex justify-end">
             <button onClick={handleTestAndSave} disabled={status === 'testing'} className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition flex items-center gap-2 disabled:opacity-50">
                {status === 'testing' ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                {status === 'testing' ? 'Validating Keys...' : 'Test & Save Keys'}
              </button>
          </div>

          {models.length > 0 && (
             <div className="space-y-4 pt-8 border-t border-white/5 animate-in fade-in slide-in-from-top-4">
                <h3 className="text-lg font-bold text-white">2. Select Your Engine</h3>
                <div className="grid gap-3">
                   {models.map((model) => (
                      <button key={model.id} onClick={() => handleModelSelect(model.id)} className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${selectedModel === model.id ? 'bg-emerald-500/10 border-emerald-500/50 text-white' : 'bg-white/5 border-transparent hover:bg-white/10 text-slate-400'}`}>
                         <div className="flex items-center gap-3">
                            <span className="font-medium">{model.name}</span>
                         </div>
                         {selectedModel === model.id && <CheckCircle2 size={20} className="text-emerald-500" />}
                      </button>
                   ))}
                </div>
             </div>
          )}

          {(!keys.openai && !keys.gemini) && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex gap-4">
               <Zap className="text-yellow-400 shrink-0" />
               <div className="space-y-1">
                  <p className="font-bold text-white text-sm">Free Mode Active</p>
                  <p className="text-xs text-slate-400">You haven't provided any keys. The app will function using "Mock Data".</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SettingsIcon({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
}
