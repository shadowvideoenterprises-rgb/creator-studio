'use client'
import { useState, useEffect, use } from 'react'
import { Layers, Image as ImageIcon, Mic, Play, Clock, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { Storyboard } from './components/Storyboard'
import { TimelineStrip } from './components/TimelineStrip'
import { useToast } from '@/components/ToastProvider'
import Link from 'next/link'

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const projectId = resolvedParams.id
  const { toast } = useToast()
  
  const [project, setProject] = useState<any>(null)
  const [scenes, setScenes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchProject() }, [])

  const fetchProject = async () => {
    const { data } = await supabase.from('projects').select('*').eq('id', projectId).single()
    const { data: scn } = await supabase.from('scenes').select('*').eq('project_id', projectId).order('sequence_order')
    
    if (data) setProject(data)
    if (scn) setScenes(scn)
    setLoading(false)
  }

  // Calculate Stats
  const totalDuration = scenes.reduce((acc, s) => acc + (s.estimated_duration || 0), 0)
  const totalImages = scenes.filter(s => s.image_url).length
  const totalAudio = scenes.filter(s => s.audio_url).length

  if (loading) return <div className="text-white p-10 flex items-center gap-2"><div className="w-4 h-4 bg-indigo-500 animate-pulse rounded-full"></div> Loading Studio...</div>

  return (
    <div className="flex h-screen bg-black text-white">
      {/* SIDEBAR */}
      <div className="w-64 border-r border-white/10 p-6 flex flex-col gap-2 bg-[#0a0a0a]">
        <div className="font-bold text-xl mb-8 flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg"></div> Studio
        </div>
        
        <Link href="/dashboard" className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-6 hover:text-white transition-colors">
            <ArrowLeft size={12} /> Back to Projects
        </Link>
        
        <div className="space-y-1">
            <Link href={`/dashboard/project/${projectId}`} className="flex items-center gap-3 px-4 py-3 bg-indigo-600/10 text-indigo-400 rounded-xl font-bold border border-indigo-500/20">
                <Layers size={18} /> Storyboard
            </Link>
            <Link href={`/dashboard/project/${projectId}/visuals`} className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                <ImageIcon size={18} /> Visuals
            </Link>
            <Link href={`/dashboard/project/${projectId}/audio`} className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                <Mic size={18} /> Audio
            </Link>
        </div>
        
        <div className="mt-auto pt-6 border-t border-white/10">
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 mb-4">
                <div className="text-xs text-slate-400 mb-1">Project Status</div>
                <div className="flex items-center gap-2 font-bold text-sm">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> {project?.status || 'Active'}
                </div>
            </div>
            <Link href={`/dashboard/project/${projectId}/launch`} className="flex items-center justify-center gap-2 w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors">
                <Play size={18} fill="black" /> Launch
            </Link>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#0a0a0a]">
            <h1 className="font-bold text-lg truncate max-w-md" title={project?.title}>{project?.title}</h1>
            
            {/* STATS */}
            <div className="flex items-center gap-6 text-xs font-bold">
                 <div className="flex items-center gap-2 text-slate-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                    <Clock size={14} className={totalDuration > 65 ? "text-yellow-500" : "text-emerald-500"} />
                    <span className="text-white">{totalDuration}s</span>
                 </div>
                 <div className="text-slate-500">
                    <span className={totalImages === scenes.length ? "text-emerald-400" : "text-white"}>{totalImages}</span>/{scenes.length} Visuals
                 </div>
                 <div className="text-slate-500">
                    <span className={totalAudio === scenes.length ? "text-emerald-400" : "text-white"}>{totalAudio}</span>/{scenes.length} Audio
                 </div>
            </div>
        </header>

        {/* TIMELINE STRIP */}
        <TimelineStrip 
            scenes={scenes} 
            totalDuration={totalDuration} 
            onSelectScene={(id) => {
                const el = document.getElementById(`scene-${id}`);
                el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }} 
        />

        {/* WORKSPACE */}
        <div className="flex-1 overflow-y-auto bg-black p-8">
           <div className="max-w-7xl mx-auto pb-20">
               <Storyboard 
                    scenes={scenes} 
                    onRegenerate={() => {
                        toast("Regeneration coming in next batch", "success");
                    }} 
               />
           </div>
        </div>
      </div>
    </div>
  )
}
