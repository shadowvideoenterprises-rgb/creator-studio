'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Save, Dna, Key, Plus, Trash2, ShieldCheck } from 'lucide-react'

export default function SettingsPage() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<string | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: dna } = await supabase.from('channel_profiles').select('*').eq('user_id', user.id)
    setProfiles(dna || [])
    setLoading(false)
  }

  const addProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('channel_profiles').insert({
      user_id: user?.id,
      name: 'New Channel Profile',
      tone: 'Informative',
      pacing: 'Balanced'
    }).select().single()
    
    if (data) setProfiles([...profiles, data])
  }

  const updateProfile = async (id: string, field: string, value: string) => {
    const { error } = await supabase.from('channel_profiles').update({ [field]: value }).eq('id', id)
    if (!error) {
      setProfiles(profiles.map(p => p.id === id ? { ...p, [field]: value } : p))
      setSaveStatus('Profile updated')
      setTimeout(() => setSaveStatus(null), 2000)
    }
  }

  if (loading) return <div className="p-20 text-center animate-pulse text-slate-500">Loading Configuration...</div>

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">Studio Settings</h1>
            <p className="text-slate-500 mt-2">Manage your AI configurations and Channel DNA.</p>
          </div>
          {saveStatus && <span className="text-xs font-mono text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full animate-fade-in">{saveStatus}</span>}
        </div>

        {/* Channel DNA Section */}
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <Dna className="text-purple-500" size={24} /> Channel DNA Profiles
            </h2>
            <button onClick={addProfile} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold transition">
              <Plus size={16} /> New Profile
            </button>
          </div>

          <div className="grid gap-6">
            {profiles.map((profile) => (
              <div key={profile.id} className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Channel Name</label>
                    <input 
                      defaultValue={profile.name}
                      onBlur={(e) => updateProfile(profile.id, 'name', e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:border-purple-500 outline-none transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Brand Tone</label>
                    <select 
                      defaultValue={profile.tone}
                      onChange={(e) => updateProfile(profile.id, 'tone', e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:border-purple-500 outline-none transition"
                    >
                      <option value="witty">Witty & Energetic</option>
                      <option value="informative">Informative & Serious</option>
                      <option value="hype">Hype & Viral</option>
                      <option value="cinematic">Cinematic & Calm</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Security / API Key Placeholder */}
        <section className="bg-indigo-500/5 border border-indigo-500/10 rounded-[2.5rem] p-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-400">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="font-bold text-white">API Key Security</h3>
              <p className="text-xs text-slate-500">Your keys are encrypted and never stored in plain text.</p>
            </div>
          </div>
          <button className="px-6 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold transition">
            Manage Keys
          </button>
        </section>

      </div>
    </div>
  )
}