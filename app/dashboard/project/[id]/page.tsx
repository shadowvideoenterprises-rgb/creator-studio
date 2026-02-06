'use client'
import { useState, useEffect, use } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useJobStatus } from '@/hooks/useJobStatus'
import SceneEditor from '@/components/editor/SceneEditor'
import { Sparkles, Layout, Zap, CheckCircle2, DollarSign, Download } from 'lucide-react'
import { Scene } from '@/lib/types'

export default function ProjectWorkspace({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const projectId = resolvedParams.id

  const [project, setProject] = useState<any>(null)
  const [scenes, setScenes] = useState<Scene[]>([])
  const [estimate, setEstimate] = useState<number>(0)
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const { progress, message, status } = useJobStatus(currentJobId)

  useEffect(() => {
    fetchProjectData()
  }, [projectId])

  useEffect(() => {
    if (scenes.length > 0) fetchCostEstimate()
  }, [scenes])

  useEffect(() => {
    if (status === 'completed') {
      fetchProjectData()
      setTimeout(() => setCurrentJobId(null), 3000)
    }
  }, [status])

  const fetchProjectData = async () => {
    const { data: proj } = await supabase.from('projects').select('*').eq('id', projectId).single()
    const { data: scns } = await supabase
      .from('scenes')
      .select('*, scene_assets(*)')
      .eq('project_id', projectId)
      .order('sequence_order', { ascending: true })
    
    setProject(proj)
    setScenes(scns || [])
  }

  const fetchCostEstimate = async () => {
    const res = await fetch(`/api/analytics/cost?projectId=${projectId}`)
    const data = await res.json()
    setEstimate(data.estimate)
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const res = await fetch(`/api/export/${projectId}`, { method: 'POST' })
      const json = await res.json()
      
      // Trigger File Download
      const blob = new Blob([JSON.stringify(json.data, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${project.title.replace(/\s+/g, '_')}_export.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (e) {
      console.error(e)
      alert('Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  const generateScript = async () => {
    const res = await fetch('/api/generate/script', {
      method: 'POST',
      body: JSON.stringify({ projectId: projectId, title: project.title, context: project.description, userId: project.user_id })
    })
    const data = await res.json()
    if (data.jobId) setCurrentJobId(data.jobId)
  }

  const runBatchAssets = async () => {
    const res = await fetch('/api/generate/batch', {
      method: 'POST',
      body: JSON.stringify({ projectId: projectId, userId: project.user_id })
    })
    const data = await res.json()
    if (data.success && data.jobId) {
       setCurrentJobId(data.jobId)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 p-8 pb-32">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-end border-b border-white/5 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
               <h1 className="text-4xl font-black text-white tracking-tight">{project?.title || 'Loading...'}</h1>
               <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <DollarSign size={12} className="text-emerald-500" />
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Est: ${estimate}</span>
               </div>
            </div>
            <p className="text-slate-500 flex items-center gap-2 italic">
              <Layout size={14} /> Workspace / Phase 2: Production
            </p>
          </div>
          <div className="flex gap-4">
             {/* NEW: Export Button */}
             <button onClick={handleExport} disabled={isExporting} className="px-4 py-3 bg-white/5 border border-white/10 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-white/10 transition-all">
               <Download size={18} /> {isExporting ? 'Bundling...' : 'Export JSON'}
             </button>

             <button onClick={runBatchAssets} disabled={status === 'processing' || scenes.length === 0} className="px-6 py-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-500/20 transition-all disabled:opacity-30">
              <Zap size={18} /> Auto-Generate Visuals
            </button>
            <button onClick={generateScript} disabled={status === 'processing'} className="px-8 py-3 bg-white text-black rounded-2xl font-bold flex items-center gap-2 hover:bg-purple-400 transition-all active:scale-95 disabled:opacity-50">
              <Sparkles size={18} /> {scenes.length > 0 ? 'Reroll Script' : 'Generate Script'}
            </button>
          </div>
        </div>

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
              <div className={`h-full transition-all duration-700 ${status === 'completed' ? 'bg-emerald-500' : 'bg-purple-500'}`} style={{ width: `${progress}%` }} />
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