'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { 
  ArrowLeft, Brain, Image as ImageIcon, Sparkles, BookOpen, 
  Loader2, Mic, Wand2, Rocket, AlignLeft, LayoutList, FileText, Trash2
} from 'lucide-react'
import { useToast } from '@/components/ToastProvider'
import { Storyboard } from './components/Storyboard'
import { ConceptTab } from './components/ConceptTab'

export default function ProjectWorkspace() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  
  // STATE
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('concept') 
  const [project, setProject] = useState<any>(null)
  const [scenes, setScenes] = useState<any[]>([])
  const [knowledge, setKnowledge] = useState<any[]>([])
  
  // GENERATION SETTINGS
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedTone, setSelectedTone] = useState('Engaging')
  const [generating, setGenerating] = useState(false)
  
  // REVISION
  const [revisionInstruction, setRevisionInstruction] = useState('')
  const [revising, setRevising] = useState(false)
  const [newKnowledge, setNewKnowledge] = useState('')

  const TONES = ['Engaging', 'Dark & Gritty', 'Funny/Sarcastic', 'Professional/Educational', 'Fast-Paced/TikTok', 'Dramatic/Cinematic']

  useEffect(() => { fetchProjectData() }, [])

  const fetchProjectData = async () => {
    const { data: proj } = await supabase.from('projects').select('*').eq('id', id).single()
    if (proj) setProject(proj)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
        const { data: settings } = await supabase.from('user_settings').select('available_models, writing_model').eq('user_id', user.id).single()
        if (settings?.available_models) {
             const models: string[] = []
             Object.values(settings.available_models).flat().forEach((m: any) => {
                 if (!m.id.includes('banana') && !m.id.includes('image')) models.push(m.id)
             })
             setAvailableModels(models)
             if (settings.writing_model && models.includes(settings.writing_model)) setSelectedModel(settings.writing_model)
             else if (models.length > 0) setSelectedModel(models[0])
        }
    }

    const { data: scn } = await supabase.from('scenes').select('*').eq('project_id', id).order('sequence_order')
    if (scn) setScenes(scn)
    const { data: knw } = await supabase.from('project_knowledge').select('*').eq('project_id', id).order('created_at', { ascending: false })
    if (knw) setKnowledge(knw)
    setLoading(false)
  }

  const handleGenerateScript = async () => {
      if (!selectedModel) { toast("Select a model first", "error"); return; }
      setGenerating(true)
      toast(`Writing script in ${selectedTone} style...`, "loading", 2000)
      
      const res = await fetch('/api/generate/script', {
          method: 'POST',
          body: JSON.stringify({ 
              projectId: id, 
              title: project.title, 
              model: selectedModel,
              tone: selectedTone 
          })
      })
      const data = await res.json()
      
      if(data.success) {
          await fetchProjectData()
          setActiveTab('script')
          toast("Script Written!", "success")
      } else {
          toast(data.error || "Generation Failed", "error")
      }
      setGenerating(false)
  }

  const handleReviseScript = async () => {
      if (!revisionInstruction) return
      setRevising(true)
      toast("Revising...", "loading")
      const res = await fetch('/api/generate/revise', {
          method: 'POST',
          body: JSON.stringify({ projectId: id, instruction: revisionInstruction, model: selectedModel })
      })
      if(res.ok) { await fetchProjectData(); setRevisionInstruction(''); toast("Script Revised!", "success"); }
      setRevising(false)
  }
  const addKnowledge = async () => {
      if(!newKnowledge) return
      await supabase.from('project_knowledge').insert({ project_id: id, content: newKnowledge, source_name: 'User' })
      setNewKnowledge('')
      fetchProjectData()
  }
  const deleteKnowledge = async (kId: string) => {
      await supabase.from('project_knowledge').delete().eq('id', kId)
      setKnowledge(knowledge.filter(k => k.id !== kId))
  }

  if (loading) return <div className="text-center p-20 text-slate-500">Loading Workspace...</div>

  return (
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
      
      {/* HEADER */}
      <div className="fixed top-0 left-64 right-0 h-16 bg-black/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="text-slate-400 hover:text-white"><ArrowLeft size={20}/></button>
              <div><h1 className="font-bold text-lg max-w-md truncate">{project?.title || 'Untitled Project'}</h1></div>
          </div>
          
          <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5 border border-white/5">
                  <Brain size={14} className="text-slate-500" />
                  <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="bg-transparent text-xs font-bold text-slate-300 outline-none cursor-pointer max-w-[150px]">
                      {availableModels.map((m: any) => <option key={m} value={m} className="bg-black text-white">{m}</option>)}
                  </select>
              </div>
              <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5 border border-white/5">
                  <AlignLeft size={14} className="text-slate-500" />
                  <select value={selectedTone} onChange={(e) => setSelectedTone(e.target.value)} className="bg-transparent text-xs font-bold text-slate-300 outline-none cursor-pointer">
                      {TONES.map(t => <option key={t} value={t} className="bg-black text-white">{t}</option>)}
                  </select>
              </div>
              {activeTab !== 'concept' && (
                  <button onClick={handleGenerateScript} disabled={generating} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold text-sm flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-purple-900/20">
                      {generating ? <Loader2 className="animate-spin" size={16}/> : <Sparkles size={16} />} 
                      <span>{scenes.length > 0 ? 'Regenerate' : 'Generate'}</span>
                  </button>
              )}
          </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 mt-16 p-8 overflow-y-auto pb-40">
          
          {/* NAV TABS */}
          <div className="flex gap-4 mb-8">
               <button onClick={() => setActiveTab('concept')} className={`px-6 py-3 rounded-xl border flex items-center gap-2 font-bold transition-all ${activeTab === 'concept' ? 'bg-purple-900/20 border-purple-500 text-purple-400' : 'border-white/5 text-slate-500 hover:text-white'}`}>
                   <LayoutList size={18} /> Concept
               </button>
               <button onClick={() => setActiveTab('research')} className={`px-6 py-3 rounded-xl border flex items-center gap-2 font-bold transition-all ${activeTab === 'research' ? 'bg-blue-900/20 border-blue-500 text-blue-400' : 'border-white/5 text-slate-500 hover:text-white'}`}>
                   <BookOpen size={18} /> Research
               </button>
               <button onClick={() => setActiveTab('script')} className={`px-6 py-3 rounded-xl border flex items-center gap-2 font-bold transition-all ${activeTab === 'script' ? 'bg-emerald-900/20 border-emerald-500 text-emerald-400' : 'border-white/5 text-slate-500 hover:text-white'}`}>
                   <FileText size={18} /> Script
               </button>
               <button onClick={() => setActiveTab('storyboard')} className={`px-6 py-3 rounded-xl border flex items-center gap-2 font-bold transition-all ${activeTab === 'storyboard' ? 'bg-pink-900/20 border-pink-500 text-pink-400' : 'border-white/5 text-slate-500 hover:text-white'}`}>
                   <ImageIcon size={18} /> Storyboard
               </button>
          </div>

          {/* TAB CONTENT */}
          {activeTab === 'concept' && (
              <ConceptTab projectId={id as string} project={project} model={selectedModel} onUpdate={fetchProjectData} />
          )}

          {activeTab === 'research' && (
              <div className="grid grid-cols-2 gap-8 animate-in fade-in">
                  <div className="space-y-4">
                       <textarea value={newKnowledge} onChange={(e) => setNewKnowledge(e.target.value)} placeholder="Paste facts, stats, or links here..." className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-white resize-none"/>
                       <button onClick={addKnowledge} className="w-full py-2 bg-blue-600 rounded-lg font-bold text-sm">Add Research Note</button>
                  </div>
                  <div className="space-y-2">
                       {knowledge.map(k => (
                           <div key={k.id} className="p-4 rounded-xl border border-white/5 flex justify-between group hover:border-blue-500/30 transition-all">
                               <p className="text-sm text-slate-300">{k.content}</p>
                               <button onClick={() => deleteKnowledge(k.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500"><Trash2 size={14}/></button>
                           </div>
                       ))}
                  </div>
              </div>
          )}

          {activeTab === 'script' && (
              <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
                   {scenes.length === 0 && !generating && (
                       <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-3xl bg-white/5 flex flex-col items-center justify-center">
                           <Rocket size={48} className="text-emerald-500 mb-4" />
                           <h3 className="text-2xl font-bold text-white mb-2">Ready to write?</h3>
                           <p className="text-slate-400 max-w-md mb-8">Using <span className="text-emerald-400">{selectedModel}</span> in <span className="text-purple-400">{selectedTone}</span> tone.</p>
                           <button onClick={handleGenerateScript} className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-lg flex items-center gap-3 shadow-2xl">
                               <Sparkles size={24} /> Generate Script
                           </button>
                       </div>
                   )}
                   {generating && scenes.length === 0 && (
                       <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-purple-500 mb-4" size={48}/><p className="text-slate-400 animate-pulse">Writing your masterpiece...</p></div>
                   )}
                   {scenes.map((scene, i) => (
                       <div key={scene.id} className="flex gap-6 p-6 rounded-2xl border border-white/5 bg-[#121214] hover:border-emerald-500/30 transition-all group">
                           <div className="text-emerald-500 font-mono font-bold text-xl opacity-50">{(i+1).toString().padStart(2, '0')}</div>
                           <div className="space-y-4 flex-1">
                               <div><div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2"><ImageIcon size={12}/> Visual</div><p className="text-slate-300 font-medium leading-relaxed bg-black/20 p-3 rounded-lg border border-white/5">{scene.visual_description}</p></div>
                               <div className="pl-4 border-l-2 border-emerald-500/20"><div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-2"><Mic size={12}/> Voiceover</div><p className="text-white text-lg leading-relaxed font-serif tracking-wide">{scene.audio_text}</p></div>
                           </div>
                       </div>
                   ))}
                   {scenes.length > 0 && (
                       <div className="sticky bottom-4 bg-[#1a1a20]/90 backdrop-blur-lg border border-emerald-500/30 p-4 rounded-2xl shadow-2xl flex gap-3 items-center mt-8 z-20">
                           <Wand2 size={20} className="text-emerald-400" />
                           <input value={revisionInstruction} onChange={(e) => setRevisionInstruction(e.target.value)} placeholder="Revision instruction..." className="flex-1 bg-transparent text-white focus:outline-none" onKeyDown={(e) => e.key === 'Enter' && handleReviseScript()} />
                           <button onClick={handleReviseScript} disabled={revising} className="px-4 py-2 bg-emerald-600 rounded-lg text-sm font-bold">Revise</button>
                       </div>
                   )}
              </div>
          )}

          {activeTab === 'storyboard' && <Storyboard projectId={id as string} scenes={scenes} onUpdate={fetchProjectData} />}
      </div>
    </div>
  )
}
