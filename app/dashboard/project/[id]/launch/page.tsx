'use client'
import { useState, useEffect, use } from 'react'
import { Rocket, Youtube, Instagram, Download, Copy, Check, Sparkles, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from '@/components/ToastProvider'
import { VideoRenderer } from './VideoRenderer' // Import the new component

export default function LaunchPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const projectId = resolvedParams.id
  const { toast } = useToast()
  
  const [project, setProject] = useState<any>(null)
  const [scenes, setScenes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchProject() }, [])

  const fetchProject = async () => {
    const { data } = await supabase.from('projects').select('*').eq('id', projectId).single()
    const { data: scn } = await supabase.from('scenes').select('*, scene_assets(*)').eq('project_id', projectId).order('sequence_order')
    
    if (data) setProject(data)
    if (scn) setScenes(scn)
    setLoading(false)
  }

  if (loading) return <div className="p-20 text-center text-slate-500">Loading Launchpad...</div>

  return (
    <div className="p-8 min-h-screen max-w-6xl mx-auto animate-in fade-in">
      {/* ... (Previous Header UI) ... */}
      <div className="mb-12 text-center space-y-4">
        <h1 className="text-4xl font-black text-white">Ready for Liftoff</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col */}
        <div className="lg:col-span-1 space-y-6">
           {/* ... (Previous Tabs) ... */}
           
           {/* NEW: RENDERER */}
           <VideoRenderer scenes={scenes} projectTitle={project.title} />
        </div>

        {/* Right: Metadata Editor (Existing Code) */}
        <div className="lg:col-span-2">
            {/* ... (Previous Metadata Editor Code) ... */}
            <div className="bg-[#121214] p-8 rounded-3xl border border-white/5 text-center text-slate-500">
                Metadata Editor (Placeholder for existing UI)
            </div>
        </div>

      </div>
    </div>
  )
}
