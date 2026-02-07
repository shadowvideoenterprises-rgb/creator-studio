'use client'
import { useState } from 'react'
import { Image as ImageIcon, RefreshCw, Wand2, Loader2, Download, Video, Search } from 'lucide-react'
import { useToast } from '@/components/ToastProvider'

interface StoryboardProps {
  projectId: string
  scenes: any[]
  onUpdate: () => void 
}

export function Storyboard({ projectId, scenes, onUpdate }: StoryboardProps) {
  const { toast } = useToast()
  
  const [sourceMode, setSourceMode] = useState<'ai' | 'stock'>('ai')
  const [loadingSceneId, setLoadingSceneId] = useState<string | null>(null)
  const [generatingAll, setGeneratingAll] = useState(false)

  const handleExecute = async (sceneId: string | null) => {
    if (sceneId) setLoadingSceneId(sceneId)
    else setGeneratingAll(true)

    const endpoint = sourceMode === 'ai' ? '/api/generate/image' : '/api/generate/stock'

    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            body: JSON.stringify({ projectId, sceneId }) 
        })
        const data = await res.json()
        
        if (data.success) {
            toast(sceneId ? "Visual Updated" : "Storyboard Populated", "success")
            onUpdate() 
        } else {
            toast(data.error || "Operation Failed", "error")
        }
    } catch (e) {
        // FIX: Changed "info" to "error" to match the allowed types
        if (sourceMode === 'stock') toast("Stock Engine not connected yet (Phase 2.3)", "error")
        else toast("Network Error", "error")
    }

    setLoadingSceneId(null)
    setGeneratingAll(false)
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-20">
        
        {/* HEADER TOOLBAR */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-[#1a1a20] p-6 rounded-2xl border border-white/5 gap-4">
            <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <ImageIcon className="text-pink-500"/> Visual Storyboard
                </h2>
                <p className="text-slate-500 text-sm">Visualize your script scenes.</p>
            </div>

            <div className="flex items-center gap-4 bg-black/40 p-1 rounded-xl border border-white/5">
                <button 
                    onClick={() => setSourceMode('ai')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${sourceMode === 'ai' ? 'bg-pink-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    <Wand2 size={16}/> AI Generator
                </button>
                <button 
                    onClick={() => setSourceMode('stock')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${sourceMode === 'stock' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    <Video size={16}/> Stock Footage
                </button>
            </div>

            <button 
                onClick={() => handleExecute(null)}
                disabled={generatingAll || scenes.length === 0}
                className={`px-6 py-3 font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg disabled:opacity-50 ${sourceMode === 'ai' ? 'bg-white/10 hover:bg-pink-600 text-white' : 'bg-white/10 hover:bg-blue-600 text-white'}`}
            >
                {generatingAll ? <Loader2 className="animate-spin" size={18}/> : (sourceMode === 'ai' ? <Wand2 size={18}/> : <Search size={18}/>)}
                <span>{generatingAll ? 'Working...' : (sourceMode === 'ai' ? 'Visualize All' : 'Auto-Match Stock')}</span>
            </button>
        </div>

        {/* SCENE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {scenes.map((scene, i) => (
                <div key={scene.id} className="group bg-[#121214] border border-white/5 rounded-2xl overflow-hidden hover:border-pink-500/30 transition-all flex flex-col">
                    
                    {/* VISUAL AREA */}
                    <div className="aspect-video bg-black relative flex items-center justify-center border-b border-white/5 overflow-hidden">
                        {scene.image_url ? (
                            <img src={scene.image_url} alt="Scene Visual" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        ) : (
                            <div className="text-slate-600 flex flex-col items-center gap-2">
                                {sourceMode === 'ai' ? <ImageIcon size={32} opacity={0.5}/> : <Video size={32} opacity={0.5}/>}
                                <span className="text-xs font-mono uppercase">Empty Slot</span>
                            </div>
                        )}
                        
                        {/* OVERLAY ACTIONS */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4 backdrop-blur-sm">
                            <button 
                                onClick={() => handleExecute(scene.id)}
                                disabled={!!loadingSceneId}
                                className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform"
                                title={sourceMode === 'ai' ? "Regenerate AI" : "Search New Stock"}
                            >
                                {loadingSceneId === scene.id ? <Loader2 className="animate-spin" size={20}/> : (sourceMode === 'ai' ? <RefreshCw size={20}/> : <Search size={20}/>)}
                            </button>
                        </div>

                        {/* SEQUENCE BADGE */}
                        <div className="absolute top-3 left-3 px-2 py-1 bg-black/80 text-white text-xs font-bold rounded-md font-mono border border-white/10">
                            SCENE {scene.sequence_order}
                        </div>
                    </div>

                    {/* TEXT CONTENT */}
                    <div className="p-4 flex-1 flex flex-col">
                        <div className="mb-3">
                            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">
                                {sourceMode === 'ai' ? 'Visual Prompt' : 'Search Query'}
                            </p>
                            <p className="text-slate-300 text-sm line-clamp-3">{scene.visual_description}</p>
                        </div>
                        <div className="mt-auto pt-3 border-t border-white/5">
                            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Voiceover</p>
                            <p className="text-slate-400 text-xs line-clamp-2 italic">"{scene.audio_text}"</p>
                        </div>
                    </div>

                </div>
            ))}
        </div>
    </div>
  )
}
