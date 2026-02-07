'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { ArrowLeft, Brain, Image as ImageIcon, Sparkles, BookOpen, Loader2, AlignLeft, LayoutList, FileText, Activity } from 'lucide-react'
import { useToast } from '@/components/ToastProvider'
import { Storyboard } from './components/Storyboard'
import { ConceptTab } from './components/ConceptTab'
import { ResearchTab } from './components/ResearchTab'
import { Timeline } from './components/Timeline'

export default function ProjectWorkspace() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('concept') 
  const [project, setProject] = useState<any>(null)
  const [scenes, setScenes] = useState<any[]>([])
  const [knowledge, setKnowledge] = useState<any[]>([])
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedTone, setSelectedTone] = useState('Engaging')
  const [generating, setGenerating] = useState(false)
  
  const TONES = ['Engaging', 'Dark & Gritty', 'Funny/Sarcastic', 'Professional/Educational', 'Fast-Paced/TikTok', 'Dramatic/Cinematic']

  useEffect(() => { fetchProjectData() }, [])

  const fetchProjectData = async () => {
    const { data: proj } = await supabase.from('projects').select('*').eq('id', id).single()
    if (proj) setProject(proj)
    
    // Auth & Settings Check
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
        const { data: settings } = await supabase.from('user_settings').select('available_models, writing_model').eq('user_id', user.id).single()
        if (settings?.available_models?.google) {
             const models = settings.available_models.google.filter((m: any) => m.type === 'text').map((m: any) => m.id)
             setAvailableModels(models)
             if (models.length > 0) setSelectedModel(models[0])
        }
    }

    const { data: scn } = await supabase.from('scenes').select('*').eq('project_id', id).order('sequence_order')
    if (scn) setScenes(scn)
    
    const { data: knw } = await supabase.from('project_knowledge').select('*').eq('project_id', id).order('created_at', { ascending: false })
    if (knw) setKnowledge(knw)
    
    setLoading(false)
  }

  const handleGenerateScript = async () => {
      setGenerating(true)
      toast(`Writing script...`, "loading")
      const res = await fetch('/api/generate/script', {
          method: 'POST',
          body: JSON.stringify({ projectId: id, title: project.title, model: selectedModel, tone: selectedTone })
      })
      const data = await res.json()
      if(data.success) { await fetchProjectData(); setActiveTab('script'); toast("Script Written!", "success"); } 
      else { toast(data.error || "Generation Failed", "error"); }
      setGenerating(false)
  }

  const handleReorder = async (sceneId: string, newIndex: number) => {
      // Optimistic Update
      const oldScenes = [...scenes]
      const oldIndex = scenes.findIndex(s => s.id === sceneId)
      const [moved] = oldScenes.splice(oldIndex, 1)
      oldScenes.splice(newIndex, 0, moved)
      setScenes(oldScenes) // Update UI immediately

      const res = await fetch('/api/project/reorder', {
          method: 'POST',
          body: JSON.stringify({ projectId: id, sceneId, newIndex })
      })
      if (!res.ok) {
          toast("Reorder failed", "error")
          fetchProjectData() // Revert
      }
  }

  if (loading) return <div className="text-center p-20 text-slate-500">Loading Workspace...</div>

  return (
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
      <div className="fixed top-0 left-64 right-0 h-16 bg-black/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="text-slate-400 hover:text-white"><ArrowLeft size={20}/></button>
              <div><h1 className="font-bold text-lg max-w-md truncate">{project?.title || 'Untitled Project'}</h1></div>
          </div>
          <div className="flex items-center gap-3">
             <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs font-bold text-slate-300 outline-none">{availableModels.map(m => <option key={m} value={m} className="bg-black">{m}</option>)}</select>
             <select value={selectedTone} onChange={(e) => setSelectedTone(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs font-bold text-slate-300 outline-none">{TONES.map(t => <option key={t} value={t} className="bg-black">{t}</option>)}</select>
             <button onClick={handleGenerateScript} disabled={generating} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-purple-900/20">{generating ? <Loader2 className="animate-spin" size={16}/> : <Sparkles size={16} />} <span>Generate</span></button>
          </div>
      </div>

      <div className="flex-1 mt-16 p-8 overflow-y-auto pb-40">
          <div className="flex gap-4 mb-8">
               <button onClick={() => setActiveTab('concept')} className={`px-6 py-3 rounded-xl border flex items-center gap-2 font-bold transition-all ${activeTab === 'concept' ? 'bg-purple-900/20 border-purple-500 text-purple-400' : 'border-white/5 text-slate-500 hover:text-white'}`}><LayoutList size={18} /> Concept</button>
               <button onClick={() => setActiveTab('research')} className={`px-6 py-3 rounded-xl border flex items-center gap-2 font-bold transition-all ${activeTab === 'research' ? 'bg-blue-900/20 border-blue-500 text-blue-400' : 'border-white/5 text-slate-500 hover:text-white'}`}><BookOpen size={18} /> Research</button>
               <button onClick={() => setActiveTab('script')} className={`px-6 py-3 rounded-xl border flex items-center gap-2 font-bold transition-all ${activeTab === 'script' ? 'bg-emerald-900/20 border-emerald-500 text-emerald-400' : 'border-white/5 text-slate-500 hover:text-white'}`}><FileText size={18} /> Script</button>
               <button onClick={() => setActiveTab('storyboard')} className={`px-6 py-3 rounded-xl border flex items-center gap-2 font-bold transition-all ${activeTab === 'storyboard' ? 'bg-pink-900/20 border-pink-500 text-pink-400' : 'border-white/5 text-slate-500 hover:text-white'}`}><ImageIcon size={18} /> Storyboard</button>
               <button onClick={() => setActiveTab('timeline')} className={`px-6 py-3 rounded-xl border flex items-center gap-2 font-bold transition-all ${activeTab === 'timeline' ? 'bg-orange-900/20 border-orange-500 text-orange-400' : 'border-white/5 text-slate-500 hover:text-white'}`}><Activity size={18} /> Timeline</button>
          </div>

          {activeTab === 'concept' && <ConceptTab projectId={id as string} project={project} model={selectedModel} onUpdate={fetchProjectData} />}
          {activeTab === 'research' && <ResearchTab projectId={id as string} project={project} knowledge={knowledge} onUpdate={fetchProjectData} />}
          
          {activeTab === 'script' && (
              <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
                   {scenes.map((scene, i) => (
                       <div key={scene.id} className="flex gap-6 p-6 rounded-2xl border border-white/5 bg-[#121214]">
                           <div className="text-emerald-500 font-mono font-bold text-xl opacity-50">{(i+1).toString().padStart(2, '0')}</div>
                           <div className="space-y-4 flex-1">
                               <div><div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Visual</div><p className="text-slate-300 font-medium bg-black/20 p-3 rounded-lg border border-white/5">{scene.visual_description}</p></div>
                               <div className="pl-4 border-l-2 border-emerald-500/20"><div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Voiceover</div><p className="text-white text-lg font-serif">{scene.audio_text}</p></div>
                           </div>
                       </div>
                   ))}
              </div>
          )}

          {activeTab === 'storyboard' && <Storyboard projectId={id as string} scenes={scenes} onUpdate={fetchProjectData} />}
          
          {/* NEW TAB */}
          {activeTab === 'timeline' && <Timeline scenes={scenes} onReorder={handleReorder} />}
      </div>
    </div>
  )
}
