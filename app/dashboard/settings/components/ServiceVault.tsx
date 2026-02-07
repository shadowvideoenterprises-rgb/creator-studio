'use client'
import { useState } from 'react'
import { CheckCircle, Plus, XCircle, Loader2, RefreshCw, Trash2 } from 'lucide-react'
import { useToast } from '@/components/ToastProvider'
import { supabase } from '@/lib/supabaseClient'

interface ServiceVaultProps {
  apiKeys: Record<string, string>
  onUpdateKey: (provider: string, key: string, models: any[]) => void
}

const SERVICES = [
    { id: 'openai', name: 'OpenAI', description: 'GPT-4, DALL-E, TTS' },
    { id: 'google', name: 'Google Gemini', description: 'Flash, Pro, Ultra' },
    { id: 'anthropic', name: 'Anthropic', description: 'Claude Sonnet/Opus' },
    { id: 'elevenlabs', name: 'ElevenLabs', description: 'AI Voice Cloning' },
    { id: 'replicate', name: 'Replicate', description: 'Flux, Stable Diffusion' },
]

export function ServiceVault({ apiKeys, onUpdateKey }: ServiceVaultProps) {
  const { toast } = useToast()
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [tempKey, setTempKey] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [testingId, setTestingId] = useState<string | null>(null)

  const handleTestSavedKey = async (provider: string) => {
      const savedKey = apiKeys[provider]
      if (!savedKey) return
      setTestingId(provider)
      toast(`Pinging ${SERVICES.find(s=>s.id===provider)?.name}...`, 'loading', 2000)

      try {
          const { data: { user } } = await supabase.auth.getUser()
          const res = await fetch('/api/settings/verify-key', {
              method: 'POST',
              body: JSON.stringify({ provider, apiKey: savedKey, userId: user?.id })
          })
          const data = await res.json()

          if (data.valid) {
              toast('Connection Successful!', 'success')
              onUpdateKey(provider, savedKey, data.models || [])
          } else {
              toast(`Connection Failed: ${data.error}`, 'error')
              // Optional: Wipe models on failure? 
              // For now, we only wipe if user explicitly disconnects or if the backend forced it.
              if (data.valid === false) onUpdateKey(provider, savedKey, [])
          }
      } catch (e: any) {
          toast('Network Error', 'error')
      }
      setTestingId(null)
  }

  const handleDisconnect = (provider: string) => {
      if (confirm(`Disconnect ${SERVICES.find(s=>s.id===provider)?.name}? This will remove the key and all associated models.`)) {
          onUpdateKey(provider, '', []) // Send empty key and empty models
      }
  }

  const handleVerifyAndSave = async () => {
      if (!activeModal) return
      setVerifying(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      const res = await fetch('/api/settings/verify-key', {
          method: 'POST',
          body: JSON.stringify({ provider: activeModal, apiKey: tempKey, userId: user?.id })
      })
      const data = await res.json()

      setVerifying(false)

      if (data.valid) {
          toast(`${SERVICES.find(s => s.id === activeModal)?.name} Verified!`, 'success')
          onUpdateKey(activeModal, tempKey, data.models || [])
          setActiveModal(null)
          setTempKey('')
      } else {
          toast(`Validation Failed: ${data.error}`, 'error')
      }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-right-4">
        {SERVICES.map(service => {
            const isConnected = !!apiKeys[service.id]
            const isTesting = testingId === service.id

            return (
                <div key={service.id} className={`p-6 rounded-2xl border transition-all relative overflow-hidden group ${isConnected ? 'bg-purple-900/10 border-purple-500/30' : 'bg-[#121214] border-white/5 hover:border-white/10'}`}>
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-bold text-white">{service.name}</h3>
                        {isConnected ? (
                             <div className="flex gap-2">
                                 <button onClick={() => handleTestSavedKey(service.id)} disabled={isTesting} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1 transition-all">
                                     {isTesting ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12}/>}
                                     {isTesting ? 'Testing' : 'Test'}
                                 </button>
                                 <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1"><CheckCircle size={12}/></div>
                             </div>
                        ) : (
                            <button onClick={() => setActiveModal(service.id)} className="text-xs font-bold uppercase tracking-wider flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 text-slate-500 hover:bg-white/10 hover:text-white transition-all"><Plus size={12}/> Connect</button>
                        )}
                    </div>
                    <p className="text-sm text-slate-500">{service.description}</p>
                    {isConnected && (
                        <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                            <span className="text-[10px] text-slate-600 font-mono">Key: ••••••••{apiKeys[service.id].slice(-4)}</span>
                            <div className="flex gap-3">
                                <button onClick={() => setActiveModal(service.id)} className="text-[10px] text-purple-400 hover:text-purple-300 font-bold uppercase">Update</button>
                                <button onClick={() => handleDisconnect(service.id)} className="text-[10px] text-red-500 hover:text-red-400 font-bold uppercase flex items-center gap-1"><Trash2 size={10}/> Remove</button>
                            </div>
                        </div>
                    )}
                </div>
            )
        })}

        {activeModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-8">
                <div className="bg-[#1a1a20] border border-white/10 p-8 rounded-3xl max-w-md w-full space-y-6 animate-in zoom-in-95">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-white">Connect {SERVICES.find(s => s.id === activeModal)?.name}</h2>
                        <button onClick={() => setActiveModal(null)}><XCircle className="text-slate-500 hover:text-white"/></button>
                    </div>
                    <input type="password" value={tempKey} onChange={(e) => setTempKey(e.target.value)} placeholder="Paste API Key..." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white font-mono focus:border-purple-500 outline-none" autoFocus />
                    <button onClick={handleVerifyAndSave} disabled={!tempKey || verifying} className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl flex justify-center items-center gap-2 transition-all disabled:opacity-50">
                        {verifying && <Loader2 className="animate-spin" size={16} />}
                        {verifying ? 'Verifying Capabilities...' : 'Verify & Save'}
                    </button>
                </div>
            </div>
        )}
    </div>
  )
}
