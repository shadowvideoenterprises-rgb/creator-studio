'use client'
import { useState, useEffect, use } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Image as ImageIcon, Zap, RefreshCw, Upload, Film, Loader2 } from 'lucide-react'

export default function VisualsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const projectId = resolvedParams.id
  
  const [scenes, setScenes] = useState<any[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  
  useEffect(() => { fetchScenes() }, [])

  const fetchScenes = async () => {
    const { data } = await supabase
      .from('scenes')
      .select('*, scene_assets(*)')
      .eq('project_id', projectId)
      .order('sequence_order', { ascending: true })
    setScenes(data || [])
  }

  const runBatchGeneration = async () => {
    setIsGenerating(true)
    try {
      // Call your existing Batch API
      await fetch('/api/generate/batch', {
        method: 'POST',
        body: JSON.stringify({ 
           projectId, 
           userId: (await supabase.auth.getUser()).data.user?.id,
           model: 'mock-free'
        })
      })
      
      // Poll for updates (Simulated for UI smoothness)
      await new Promise(r => setTimeout(r, 2000))
      await fetchScenes()
    } catch (e) {
      alert('Generation failed')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="p-8 min-h-screen space-y-8">
      
      {/* Header */}
      <div className="flex justify-between items-end border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <ImageIcon className="text-purple-500" />
            Visual Workspace
          </h1>
          <p className="text-slate-500 mt-2">Curate, regenerate, or upload assets for every scene.</p>
        </div>
        
        <button 
          onClick={runBatchGeneration}
          disabled={isGenerating}
          className="px-6 py-3 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-400 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="animate-spin" /> : <Zap fill="currentColor" />}
          <span>Generate All Missing</span>
        </button>
      </div>

      {/* The Storyboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scenes.map((scene) => {
          const asset = scene.scene_assets?.[0]
          
          return (
            <div key={scene.id} className="bg-[#121214] border border-white/5 rounded-2xl overflow-hidden group">
              
              {/* Scene Header */}
              <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-black/20">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Scene {scene.sequence_order}</span>
                <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-slate-400">Image</span>
              </div>

              {/* Asset View */}
              <div className="aspect-video relative bg-black/50 group/image">
                {asset ? (
                  <>
                    <img src={asset.asset_url} className="w-full h-full object-cover" />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/image:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                       <button className="px-4 py-2 bg-white text-black font-bold rounded-lg flex items-center gap-2 hover:scale-105 transition-transform">
                         <RefreshCw size={16} /> Regenerate
                       </button>
                       <div className="flex gap-2">
                         <button className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20" title="Upload Custom">
                           <Upload size={16} />
                         </button>
                         <button className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20" title="Pick Stock Video">
                           <Film size={16} />
                         </button>
                       </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 gap-2">
                    <ImageIcon size={32} />
                    <span className="text-xs font-bold">No Asset</span>
                  </div>
                )}
              </div>

              {/* Prompt Text */}
              <div className="p-4">
                 <p className="text-xs text-slate-500 font-bold uppercase mb-1">Visual Prompt</p>
                 <p className="text-sm text-slate-300 line-clamp-2" title={scene.visual_description}>
                   {scene.visual_description || 'No description provided...'}
                 </p>
              </div>

            </div>
          )
        })}
      </div>
    </div>
  )
}
