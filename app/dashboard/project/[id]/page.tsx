'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useJobStatus } from '@/hooks/useJobStatus'
import SceneEditor from '@/components/editor/SceneEditor'
import { Sparkles, Layout, Zap, CheckCircle2 } from 'lucide-react'

export default function ProjectWorkspace({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<any>(null)
  const [scenes, setScenes] = useState<any[]>([])
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)
  const { progress, message, status } = useJobStatus(currentJobId)

  useEffect(() => {
    fetchProjectData()
  }, [params.id])

  useEffect(() => {
    if (status === 'completed') {
      fetchProjectData()
      setTimeout(() => setCurrentJobId(null), 3000)
    }
  }, [status])

  const fetchProjectData = async () => {
    const { data: proj } = await supabase.from('projects').select('*').eq('id', params.id).single()
    const { data: scns } = await supabase.from('scenes').select('*').eq('project_id', params.id).order('sequence_order', { ascending: true })
    setProject(proj)
    setScenes(scns || [])
  }

  const generateScript = async () => {
    const res = await fetch('/api/generate/script', {
      method: 'POST',
      body: JSON.stringify({ projectId: params.id, title: project.title, context: project.description })
    })
    const data = await res.json()
    if (data.jobId) setCurrentJobId(data.jobId)
  }

  const runBatchAssets = async () => {
    const res = await fetch('/api/generate/batch', {
      method: 'POST',
      body: JSON.stringify({ projectId: params.id })
    })
    const data = await res.json()
    // The Batch Service generates its own Job ID; we'll track the latest progress entry
    if (data.success) {
       const { data: latestJob } = await supabase
         .from('job_progress')
         .select('job_id')
         .eq('user_id', project.user_id)
         .order('updated_at', { ascending: false })
         .limit(1)
         .single()
       if (latestJob) setCurrentJobId(latestJob.job_id)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 p-8 pb-32">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header with Dual Actions */}
        <div className="flex justify-between items-end border-b border-white/5 pb-8">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">{project?.title || 'Loading...'}</h1>
            <p className="text-slate-500 mt-2 flex items-center gap-2 italic">
              <Layout size={14} /> Workspace / Phase 2: Production
            </p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={runBatchAssets}
              disabled={status === 'processing' || scenes.length === 0}
              className="px-6 py-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-500/20 transition-all disabled:opacity-30"
            >
              <Zap size={18} /> Auto-Generate Visuals
            </button>
            <button 
              onClick={generateScript}
              disabled={status === 'processing'}
              className="px-8 py-3 bg-white text-black rounded-2xl font-bold flex items-center gap-2 hover:bg-purple-400 transition-all active:scale-95 disabled:opacity-50"
            >
              <Sparkles size={18} /> {scenes.length > 0 ? 'Reroll Script' : 'Generate Script'}
            </button>
          </div>
        </div>

        {/* Global Progress Indicator */}
        {currentJobId && (
          <div className={`rounded-2xl p-6 transition-all duration-500 ${status === 'completed' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-purple-500/10 border border-purple-500/20'}`}>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                {status === 'completed' ? <CheckCircle2 className="text-emerald-500" size={20} /> : <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping" />}
                <span className={`text-sm font-bold uppercase tracking-widest ${status === 'completed' ? 'text-emerald-500' : 'text-purple-400'}`}>{message}</span>
              </div>
              <span className={`text-sm font-mono ${status === 'completed' ? 'text-emerald-500' : 'text-purple-400'}`}>{progress}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-700 ${status === 'completed' ? 'bg-emerald-500' : 'bg-purple-500'}`} 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>
        )}

        <div className="grid gap-8">
          {scenes.map((scene) => (
            <SceneEditor 
              key={scene.id} 
              scene={scene} 
              onUpdate={(id: string, field: string, val: string) => {
                setScenes(scenes.map(s => s.id === id ? { ...s, [field]: val } : s))
              }}
              onDelete={fetchProjectData}
            />
          ))}
        </div>
      </div>
    </div>
  )
}