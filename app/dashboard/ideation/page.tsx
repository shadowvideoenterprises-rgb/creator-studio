'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Sparkles, ArrowLeft, Settings, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ToastProvider'
import { getModelLabel, isModelValid, sortModelsSmart } from '@/lib/model-utils'

export default function IdeationPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [ideas, setIdeas] = useState<any[]>([])
  
  const [availableModels, setAvailableModels] = useState<any[]>([])
  const [selectedModel, setSelectedModel] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => { fetchSettings() }, [])

  const fetchSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
        setUserId(user.id)
        const { data: settings } = await supabase.from('user_settings').select('available_models, ideation_model').eq('user_id', user.id).single()
        
        if (settings) {
            let models: any[] = []

            // 1. USE SHARED LOGIC
            if (settings.available_models) {
                 Object.entries(settings.available_models).forEach(([provider, list]: [string, any]) => {
                     list.forEach((m: any) => {
                         if (isModelValid(m.id, 'text')) {
                             models.push({ 
                                value: m.id, 
                                label: getModelLabel(m.id, provider, m.name) 
                             })
                         }
                     })
                 })
            }

            models = sortModelsSmart(models)
            
            // 2. Fallback
            if (models.length === 0) {
                models.push({ value: 'gemini-1.5-flash', label: 'Default: Gemini 1.5 Flash' })
            }

            setAvailableModels(models)

            // 3. Selection Logic
            const savedPref = settings.ideation_model
            const isValidPref = models.find(m => m.value === savedPref)
            
            if (savedPref && isValidPref) {
                setSelectedModel(savedPref)
            } else {
                setSelectedModel(models[0].value)
            }
        }
    }
  }

  const handleModelChange = async (newModel: string) => {
      setSelectedModel(newModel)
      if (userId) {
          await supabase.from('user_settings').update({ ideation_model: newModel }).eq('user_id', userId)
          toast("Preference Saved", "success")
      }
  }

  const generateIdeas = async () => {
    if (!topic) return
    setLoading(true)
    setIdeas([]) 
    
    try {
      const res = await fetch('/api/ideation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            topic, 
            style: 'Viral',
            userId: userId,
            model: selectedModel
        })
      })
      const data = await res.json()
      
      if (data.ideas && data.ideas.length > 0) {
          setIdeas(data.ideas)
      } else {
          toast("No ideas returned.", "error")
      }
    } catch (e) { 
        toast("Brainstorm Error", "error")
    }
    setLoading(false)
  }

  const convertToProject = async (idea: any) => {
    try {
        const { data, error } = await supabase.from('projects').insert({
            title: idea.title,
            user_id: userId,
            description: idea.hook,
            status: 'draft'
        }).select().single()

        if (error) throw error;
        if (data) router.push(`/dashboard/project/${data.id}`)
        
    } catch (err: any) {
        toast("Database Error", "error")
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => router.push('/dashboard')} className="mb-8 text-gray-400 hover:text-white flex items-center gap-2">
            <ArrowLeft size={16}/> Back to Dashboard
        </button>

        <div className="space-y-8 text-center mb-12">
          <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 tracking-tight">
            Idea Lab
          </h1>
          <p className="text-gray-400">Powered by your Channel DNA</p>
          
          <div className="max-w-xl mx-auto space-y-4">
              <div className="flex justify-center">
                  <div className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 border border-white/5">
                      <Settings size={14} className="text-slate-500" />
                      <select 
                        value={selectedModel}
                        onChange={(e) => handleModelChange(e.target.value)} 
                        className="bg-transparent text-xs font-bold text-slate-300 outline-none cursor-pointer text-center"
                      >
                          {availableModels.map(m => (
                              <option key={m.value} value={m.value} className="bg-black text-white">
                                  {m.label}
                              </option>
                          ))}
                      </select>
                  </div>
              </div>

              <div className="flex gap-2 relative">
                <input 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter a topic (e.g. Ancient Rome, Bitcoin)..."
                  className="flex-1 bg-gray-900 border border-gray-700 p-4 rounded-xl text-lg focus:border-purple-500 outline-none transition-all shadow-xl"
                  onKeyDown={(e) => e.key === 'Enter' && generateIdeas()}
                  autoFocus
                />
                <button 
                    onClick={generateIdeas}
                    disabled={loading || !selectedModel}
                    className="bg-purple-600 hover:bg-purple-500 px-8 rounded-xl font-bold text-lg transition-all flex items-center gap-2 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" size={20}/> : <Sparkles size={20}/>}
                </button>
              </div>
          </div>
        </div>

        {ideas.length > 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ideas.map((idea, i) => (
                   <div key={i} className="bg-[#121214] border border-white/5 rounded-2xl p-6 hover:border-purple-500/50 transition-all hover:shadow-2xl hover:shadow-purple-900/10 group flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${idea.score > 80 ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                Score: {idea.score}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold mb-3 leading-tight text-white group-hover:text-purple-300 transition-colors">{idea.title}</h3>
                        <p className="text-slate-400 text-sm mb-6 leading-relaxed">{idea.hook}</p>
                    </div>
                    <button onClick={() => convertToProject(idea)} className="w-full py-3 bg-white/5 hover:bg-purple-600 rounded-xl font-bold transition-all text-sm text-slate-300 hover:text-white">
                        🚀 Create Project
                    </button>
                   </div>
                ))}
                </div>
            </div>
        )}
      </div>
    </div>
  )
}
