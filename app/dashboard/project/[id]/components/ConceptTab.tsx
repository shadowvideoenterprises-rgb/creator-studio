'use client'
import { useState } from 'react'
import { Sparkles, Loader2, CheckCircle2, Image as ImageIcon, LayoutList, Type, Clock, Trophy, MousePointer2, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from '@/components/ToastProvider'

interface ConceptTabProps {
  projectId: string
  project: any
  model: string
  onUpdate: () => void
}

export function ConceptTab({ projectId, project, model, onUpdate }: ConceptTabProps) {
  const { toast } = useToast()
  
  // STATE
  const [isArchitecting, setIsArchitecting] = useState(false)
  const [generatingThumbId, setGeneratingThumbId] = useState<number | null>(null)
  const [selectingTitle, setSelectingTitle] = useState('')
  const [duration, setDuration] = useState(project.target_duration || 'Medium (5-8 min)')

  const DURATIONS = ['Short (< 60s)', 'Medium (5-8 min)', 'Long (15+ min)']

  // 1. GENERATE CONCEPT
  const handleGenerateConcept = async () => {
      setIsArchitecting(true)
      toast("Architecting Viral Concept...", "loading", 3000)
      
      try {
        const res = await fetch('/api/generate/outline', {
            method: 'POST',
            body: JSON.stringify({ projectId, description: project.description, model, duration })
        })
        const data = await res.json()
        
        if (data.success) { 
            toast("Concept Blueprint Created", "success")
            onUpdate()
        } else {
            toast(data.error || "Generation Failed", "error")
        }
      } catch (e) { 
          toast("Network Error: Could not reach server", "error") 
      }
      setIsArchitecting(false)
  }

  // 2. GENERATE THUMBNAIL
  const handleGenerateThumbnail = async (prompt: string, index: number) => {
      if (generatingThumbId !== null) return 
      setGeneratingThumbId(index)
      toast("Painting Thumbnail...", "loading")

      try {
          const res = await fetch('/api/generate/image', {
              method: 'POST',
              body: JSON.stringify({ projectId, prompt, type: 'thumbnail' })
          })
          const data = await res.json()

          if (data.success) {
              toast("Thumbnail Generated", "success")
              onUpdate()
          } else {
              toast(`Error: ${data.error}`, "error")
          }
      } catch (e) {
          toast("Network Error", "error")
      }
      setGeneratingThumbId(null)
  }

  // 3. SELECT TITLE
  const handleSelectTitle = async (titleData: any) => {
      // Handle both string (old) and object (new) formats
      const text = typeof titleData === 'string' ? titleData : titleData.text
      
      setSelectingTitle(text)
      const { error } = await supabase.from('projects').update({ title: text }).eq('id', projectId)
      if (error) toast("Failed to update title", "error")
      else {
          onUpdate()
          toast("Title Updated", "success")
      }
      setSelectingTitle('')
  }

  const hasConcept = project.outline && project.outline.length > 0

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
        
        {!hasConcept ? (
            <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-3xl bg-white/5 flex flex-col items-center justify-center">
                <div className="p-4 bg-purple-500/10 rounded-full text-purple-400 mb-6"><LayoutList size={48} /></div>
                <h3 className="text-2xl font-bold text-white mb-2">Architect Your Video</h3>
                <p className="text-slate-400 max-w-md mb-8">Generate viral titles, thumbnails, and a structure using <span className="text-purple-400 font-mono">{model}</span>.</p>
                <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-xl p-2 mb-8">
                    <Clock size={16} className="text-slate-500 ml-2" />
                    <select value={duration} onChange={(e) => setDuration(e.target.value)} className="bg-transparent text-white font-bold text-sm outline-none cursor-pointer p-2">
                         {DURATIONS.map(d => <option key={d} value={d} className="bg-black">{d}</option>)}
                    </select>
                </div>
                <button 
                    onClick={handleGenerateConcept} 
                    disabled={isArchitecting} 
                    className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl text-lg flex items-center gap-3 transition-all hover:scale-105 shadow-2xl shadow-purple-900/20 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                >
                    {isArchitecting ? <Loader2 className="animate-spin" size={24}/> : <Sparkles size={24} />}
                    {isArchitecting ? 'Architecting...' : 'Generate Concept'}
                </button>
            </div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT COL (Titles & Thumbnails) */}
                <div className="lg:col-span-5 space-y-8">
                    {/* TITLE SELECTOR */}
                    <div className="bg-[#121214] border border-white/5 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-4 text-slate-400 text-xs font-bold uppercase tracking-widest"><Type size={14}/> Viral Titles</div>
                        <div className="space-y-3">
                            {project.title_candidates?.map((t: any, i: number) => {
                                // Determine if using new Object format or old String format
                                const isObj = typeof t === 'object';
                                const text = isObj ? t.text : t;
                                const score = isObj ? t.score : null;
                                const reasoning = isObj ? t.reasoning : null;
                                
                                return (
                                <button 
                                    key={i} 
                                    onClick={() => handleSelectTitle(t)} 
                                    disabled={!!selectingTitle}
                                    className={`w-full text-left p-4 rounded-xl border transition-all text-sm font-medium group disabled:opacity-50 flex flex-col gap-2 ${project.title === text ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-black/20 border-white/5 hover:border-white/20'}`}
                                >
                                    <div className="flex justify-between items-start w-full gap-4">
                                        <span className={`text-base leading-tight ${project.title === text ? 'text-emerald-400 font-bold' : 'text-slate-200'}`}>{text}</span>
                                        {selectingTitle === text ? <Loader2 className="animate-spin shrink-0 text-emerald-500" size={16}/> : (project.title === text && <CheckCircle2 className="shrink-0 text-emerald-500" size={16}/>)}
                                        
                                        {/* Score Badge */}
                                        {score && project.title !== text && (
                                            <div className={`shrink-0 px-2 py-1 rounded text-[10px] font-bold border ${score >= 8 ? 'bg-green-500/10 text-green-400 border-green-500/20' : score >= 6 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                                {score}/10
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Reasoning & Metrics */}
                                    {isObj && (
                                        <div className="w-full pt-2 border-t border-white/5 mt-1">
                                            <p className="text-xs text-slate-500 italic mb-2">"{reasoning}"</p>
                                            <div className="flex gap-4 text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                                                <span className="flex items-center gap-1"><MousePointer2 size={10}/> Click: {t.metrics.clickability}</span>
                                                <span className="flex items-center gap-1"><AlertCircle size={10}/> Curio: {t.metrics.curiosity}</span>
                                                <span className="flex items-center gap-1"><Trophy size={10}/> Unique: {t.metrics.uniqueness}</span>
                                            </div>
                                        </div>
                                    )}
                                </button>
                            )})}
                        </div>
                    </div>

                    {/* THUMBNAIL SELECTOR */}
                    <div className="bg-[#121214] border border-white/5 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-4 text-slate-400 text-xs font-bold uppercase tracking-widest"><ImageIcon size={14}/> Thumbnail Concepts</div>
                        
                        {/* Display Generated Image if available */}
                        {project.thumbnail_url && (
                            <div className="mb-6 rounded-xl overflow-hidden border border-purple-500/50 shadow-lg shadow-purple-900/20 relative group">
                                 <img src={project.thumbnail_url} alt="Generated Thumbnail" className="w-full h-auto" />
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                                     <span className="text-purple-200 text-xs font-bold flex items-center gap-2"><CheckCircle2 size={14} className="text-purple-500"/> Active Selection</span>
                                 </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            {project.thumbnail_concepts?.map((t: string, i: number) => (
                                <div key={i} className="p-4 rounded-xl bg-black/20 border border-white/5 hover:border-white/20 transition-all group relative">
                                    <p className="text-sm text-slate-300 leading-relaxed mb-3">{t}</p>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleGenerateThumbnail(t, i)}
                                            disabled={generatingThumbId !== null}
                                            className="px-3 py-1.5 bg-white/5 hover:bg-purple-600 hover:text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {generatingThumbId === i ? <Loader2 className="animate-spin" size={12}/> : <Sparkles size={12}/>}
                                            {generatingThumbId === i ? 'Generating...' : 'Generate Image'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT COL: OUTLINE */}
                <div className="lg:col-span-7 space-y-4">
                    <div className="flex justify-between items-center mb-2">
                         <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest"><LayoutList size={14}/> {project.target_duration || 'Structured'} Outline</div>
                         <button 
                            onClick={handleGenerateConcept} 
                            disabled={isArchitecting}
                            className="text-xs bg-purple-500/10 text-purple-400 px-3 py-1 rounded-lg hover:bg-purple-500/20 disabled:opacity-50 flex items-center gap-2"
                         >
                            {isArchitecting && <Loader2 className="animate-spin" size={10}/>} Regenerate
                         </button>
                    </div>
                    {project.outline?.map((point: any, i: number) => (
                        <div key={i} className="flex gap-4 p-5 rounded-2xl border border-white/5 bg-[#121214] hover:border-purple-500/20 transition-all">
                            <div className="text-purple-500 font-mono font-bold text-lg opacity-50">{(i+1).toString().padStart(2, '0')}</div>
                            <div>
                                <h4 className="text-white font-bold mb-1">{point.point}</h4>
                                <p className="text-slate-400 text-sm leading-relaxed">{point.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  )
}
