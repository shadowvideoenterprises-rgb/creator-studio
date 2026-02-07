'use client'
import { useState } from 'react'
import { Search, Plus, Trash2, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from '@/components/ToastProvider'

interface ResearchTabProps {
  projectId: string
  project: any
  knowledge: any[]
  onUpdate: () => void
}

export function ResearchTab({ projectId, project, knowledge, onUpdate }: ResearchTabProps) {
  const { toast } = useToast()
  const [newNote, setNewNote] = useState('')
  const [activePoint, setActivePoint] = useState<number | null>(null)
  const [saving, setSaving] = useState(false) // Safety State

  const handleGoogleSearch = (query: string) => {
      const q = encodeURIComponent(`${query} history facts`) 
      window.open(`https://www.google.com/search?q=${q}`, '_blank')
  }

  const addKnowledge = async () => {
      if(!newNote || saving) return // Prevent double click
      setSaving(true)
      
      let content = newNote
      if (activePoint !== null && project.outline[activePoint]) {
          content = `[${project.outline[activePoint].point}] ${newNote}`
      }

      const { error } = await supabase.from('project_knowledge').insert({ 
          project_id: projectId, 
          content: content, 
          source_name: 'User Research' 
      })
      
      if (error) {
          toast("Failed to save note", "error")
      } else {
          setNewNote('')
          setActivePoint(null)
          onUpdate()
          toast("Fact Saved", "success")
      }
      setSaving(false)
  }

  const deleteKnowledge = async (id: string) => {
      await supabase.from('project_knowledge').delete().eq('id', id)
      onUpdate()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 h-[calc(100vh-200px)]">
        <div className="lg:col-span-5 flex flex-col gap-4 overflow-y-auto pr-2">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest sticky top-0 bg-black py-2 z-10">Research Missions</h3>
            {!project.outline || project.outline.length === 0 ? (
                <div className="p-8 border border-dashed border-white/10 rounded-2xl text-center text-slate-500">No outline found. Go to <b>Concept</b> tab.</div>
            ) : (
                project.outline.map((point: any, i: number) => (
                    <div key={i} className={`p-5 rounded-2xl border transition-all cursor-pointer group relative ${activePoint === i ? 'bg-blue-500/10 border-blue-500 ring-1 ring-blue-500' : 'bg-[#121214] border-white/5 hover:border-white/20'}`} onClick={() => setActivePoint(i)}>
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-blue-500 font-mono font-bold text-sm opacity-70">0{i+1}</span>
                            <button onClick={(e) => { e.stopPropagation(); handleGoogleSearch(point.description); }} className="p-2 bg-white/5 hover:bg-blue-600 hover:text-white rounded-lg text-slate-400 transition-colors"><Search size={14} /></button>
                        </div>
                        <h4 className="text-white font-bold mb-1 text-sm">{point.point}</h4>
                        <p className="text-slate-400 text-xs leading-relaxed">{point.description}</p>
                    </div>
                ))
            )}
        </div>

        <div className="lg:col-span-7 flex flex-col h-full">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Knowledge Bank</h3>
            <div className="bg-[#121214] border border-white/10 rounded-2xl p-4 mb-6 shadow-xl">
                {activePoint !== null && (
                    <div className="flex items-center gap-2 mb-2 text-blue-400 text-xs font-bold">
                        <span className="bg-blue-500/10 px-2 py-1 rounded">Targeting: {project.outline[activePoint].point}</span>
                        <button onClick={() => setActivePoint(null)} className="hover:text-white">&times;</button>
                    </div>
                )}
                <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Paste facts here..." className="w-full h-24 bg-transparent text-white placeholder-slate-600 resize-none outline-none text-sm" onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), addKnowledge())} />
                <div className="flex justify-between items-center mt-2 border-t border-white/5 pt-3">
                    <span className="text-[10px] text-slate-500">Press Enter to save</span>
                    <button onClick={addKnowledge} disabled={!newNote || saving} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs flex items-center gap-2 disabled:opacity-50">
                        {saving ? <Loader2 className="animate-spin" size={14}/> : <Plus size={14}/>} {saving ? 'Saving...' : 'Save Note'}
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {knowledge.map(k => (
                    <div key={k.id} className="p-4 rounded-xl border border-white/5 bg-black/20 flex justify-between items-start group hover:border-white/10 transition-all">
                        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{k.content}</p>
                        <button onClick={() => deleteKnowledge(k.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 p-1 hover:bg-red-500/10 rounded"><Trash2 size={14}/></button>
                    </div>
                ))}
            </div>
        </div>
    </div>
  )
}
