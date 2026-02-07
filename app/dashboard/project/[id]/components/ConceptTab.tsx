'use client'
import { useState } from 'react'
import { Sparkles, Loader2, CheckCircle2, Image as ImageIcon, LayoutList, Type } from 'lucide-react'
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
  const [generating, setGenerating] = useState(false)
  const [selectingTitle, setSelectingTitle] = useState('')

  const handleGenerateConcept = async () => {
      setGenerating(true)
      toast("Architecting Viral Concept...", "loading", 3000)
      
      try {
        const res = await fetch('/api/generate/outline', {
            method: 'POST',
            body: JSON.stringify({ projectId, description: project.description, model })
        })
        const data = await res.json()
        
        if (data.success) {
            toast("Concept Blueprint Created", "success")
            onUpdate()
        } else {
            toast(data.error || "Failed", "error")
        }
      } catch (e) { toast("Network Error", "error") }
      
      setGenerating(false)
  }

  const handleSelectTitle = async (newTitle: string) => {
      setSelectingTitle(newTitle)
      await supabase.from('projects').update({ title: newTitle }).eq('id', projectId)
      onUpdate()
      setSelectingTitle('')
      toast("Title Updated", "success")
  }

  const hasConcept = project.outline && project.outline.length > 0

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
        
        {/* EMPTY STATE / REGENERATE */}
        {!hasConcept ? (
            <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-3xl bg-white/5 flex flex-col items-center justify-center">
                <div className="p-4 bg-purple-500/10 rounded-full text-purple-400 mb-6"><LayoutList size={48} /></div>
                <h3 className="text-2xl font-bold text-white mb-2">Architect Your Video</h3>
                <p className="text-slate-400 max-w-md mb-8">
                    Generate viral titles, high-CTR thumbnail concepts, and a 5-point structural outline using <span className="text-purple-400 font-mono">{model}</span>.
                </p>
                <button onClick={handleGenerateConcept} disabled={generating} className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl text-lg flex items-center gap-3 transition-all hover:scale-105 shadow-2xl shadow-purple-900/20 disabled:opacity-50">
                    {generating ? <Loader2 className="animate-spin" size={24}/> : <Sparkles size={24} />}
                    {generating ? 'Architecting...' : 'Generate Concept'}
                </button>
            </div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT COLUMN: META (Titles & Thumbnails) */}
                <div className="space-y-8">
                    {/* TITLE SELECTOR */}
                    <div className="bg-[#121214] border border-white/5 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
                            <Type size={14}/> Viral Titles
                        </div>
                        <div className="space-y-3">
                            {project.title_candidates?.map((t: string, i: number) => (
                                <button 
                                    key={i} 
                                    onClick={() => handleSelectTitle(t)}
                                    className={`w-full text-left p-3 rounded-xl border transition-all text-sm font-medium flex justify-between items-center group ${project.title === t ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-black/20 border-white/5 text-slate-300 hover:border-white/20 hover:text-white'}`}
                                >
                                    <span>{t}</span>
                                    {project.title === t && <CheckCircle2 size={16}/>}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* THUMBNAIL CONCEPTS */}
                    <div className="bg-[#121214] border border-white/5 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
                            <ImageIcon size={14}/> Thumbnail Concepts
                        </div>
                        <div className="space-y-3">
                            {project.thumbnail_concepts?.map((t: string, i: number) => (
                                <div key={i} className="p-3 rounded-xl bg-black/20 border border-white/5 text-sm text-slate-400 leading-relaxed">
                                    {t}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: THE OUTLINE (Synopsis) */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center mb-2">
                         <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                            <LayoutList size={14}/> Structural Outline
                        </div>
                        <button onClick={handleGenerateConcept} className="text-xs text-purple-400 hover:text-purple-300">Regenerate</button>
                    </div>

                    {project.outline?.map((point: any, i: number) => (
                        <div key={i} className="flex gap-4 p-5 rounded-2xl border border-white/5 bg-[#121214] hover:border-purple-500/20 transition-all">
                            <div className="text-purple-500 font-mono font-bold text-lg opacity-50">{(i+1).toString().padStart(2, '0')}</div>
                            <div>
                                <h4 className="text-white font-bold mb-1">{point.point}</h4>
                                <p className="text-slate-400 text-sm leading-relaxed">{point.description}</p>
                                {point.research_needed && (
                                    <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-1 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wide">
                                        <Sparkles size={10}/> Research Required
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  )
}
