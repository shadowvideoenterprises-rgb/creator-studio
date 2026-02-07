'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from '@/components/ToastProvider'
import { Save, LogOut, CheckCircle2 } from 'lucide-react'
import { ServiceVault } from './components/ServiceVault'
import { EngineMatrix } from './components/EngineMatrix'

export default function SettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [view, setView] = useState<'controls' | 'vault'>('controls')
  
  const [settings, setSettings] = useState<any>({})
  const [validatedModels, setValidatedModels] = useState<Record<string, any[]>>({})

  useEffect(() => { fetchSettings() }, [])

  const fetchSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let { data } = await supabase.from('user_settings').select('*').eq('user_id', user.id).single()
    
    if (!data) {
       const { data: newData } = await supabase.from('user_settings').insert([{ user_id: user.id }]).select().single()
       data = newData
    }

    setSettings(data || {})
    if (data.available_models) setValidatedModels(data.available_models)
    setLoading(false)
  }

  // AUTO-SAVE HANDLER for Dropdowns
  const handleSettingChange = async (key: string, value: string) => {
      // 1. Optimistic Update (Instant UI change)
      setSettings((prev: any) => ({ ...prev, [key]: value }))
      
      // 2. Background Save
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
          const { error } = await supabase.from('user_settings').update({ [key]: value }).eq('user_id', user.id)
          
          if (error) {
              toast("Failed to save preference", "error")
          } else {
              // Optional: Subtle indicator that it saved, or just silent success
              // We'll show a quick toast for confirmation
              toast("Preference Saved", "success")
          }
      }
  }

  const handleUpdateKey = async (provider: string, key: string, models: any[]) => {
      const newKeys = { ...settings.api_keys, [provider]: key }
      const finalModels = key ? models : [] 
      const newModels = { ...validatedModels, [provider]: finalModels }
      
      setSettings((prev: any) => ({ ...prev, api_keys: newKeys }))
      setValidatedModels(newModels) 
      
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
         await supabase.from('user_settings').update({ 
             api_keys: newKeys,
             available_models: newModels 
         }).eq('user_id', user.id)
      }
      
      if (!key) toast(`${provider} disconnected`, 'success')
  }

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-slate-500 animate-pulse">Loading Studio Configuration...</div>

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen pb-20 relative font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-start border-b border-white/5 pb-8 mb-8">
        <div>
           <div className="flex gap-4 mb-4">
               <button onClick={() => setView('controls')} className={`text-sm font-bold px-3 py-1 rounded-full transition-all ${view === 'controls' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}>Controls</button>
               <button onClick={() => setView('vault')} className={`text-sm font-bold px-3 py-1 rounded-full transition-all ${view === 'vault' ? 'bg-white text-black' : 'text-slate-500 hover:text-white'}`}>Key Vault</button>
           </div>
           <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Studio Settings</h1>
        </div>
        
        {/* We keep this as a visual reassurance, but it's technically redundant for engines now */}
        <div className="flex gap-4 items-center">
             <div className="text-xs font-bold text-emerald-500 flex items-center gap-1 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full">
                <CheckCircle2 size={12}/> Auto-Save Active
             </div>
        </div>
      </div>

      {view === 'controls' && (
          <EngineMatrix 
             settings={settings} 
             onUpdate={handleSettingChange} // Use the new Auto-Save handler
             validatedModels={validatedModels}
          />
      )}

      {view === 'vault' && (
          <ServiceVault 
             apiKeys={settings.api_keys || {}} 
             onUpdateKey={handleUpdateKey}
          />
      )}

    </div>
  )
}
