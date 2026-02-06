'use client'
import { Scene } from '@/lib/types'
import { Trash2, Sparkles, Image as ImageIcon, Volume2, Clock, Wand2, MoreVertical } from 'lucide-react'
import { useState } from 'react'

interface SceneEditorProps {
  scene: Scene
  onUpdate: (id: string, field: string, value: string) => void
  onDelete: () => void
}

export default function SceneEditor({ scene, onUpdate, onDelete }: SceneEditorProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Filter for assets
  const visuals = scene.scene_assets?.filter(a => a.asset_type !== 'audio') || [];
  const audios = scene.scene_assets?.filter(a => a.asset_type === 'audio') || [];
  
  const activeAsset = visuals.length > 0 ? visuals[0] : null;
  const hasAudio = audios.length > 0;

  // Mock duration estimation (approx 150 words per minute)
  const wordCount = scene.audio_text?.split(' ').length || 0;
  const duration = Math.max(2, Math.round((wordCount / 150) * 60)); 

  return (
    <div 
      className="group relative bg-[#121214] border border-white/5 rounded-3xl overflow-hidden transition-all hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-900/10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      
      {/* 1. Cinematic Header */}
      <div className="h-10 bg-white/5 border-b border-white/5 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
           {/* Scene Number Badge */}
           <div className="flex items-center gap-2">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Scene</span>
             <div className="w-5 h-5 rounded bg-purple-500 text-white flex items-center justify-center text-[10px] font-bold">
               {scene.sequence_order}
             </div>
           </div>
           
           {/* Duration Estimate */}
           <div className="flex items-center gap-1.5 text-slate-600">
             <Clock size={12} />
             <span className="text-[10px] font-mono font-medium">~{duration}s</span>
           </div>

           {/* Audio Status */}
           {hasAudio && (
             <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 rounded-full">
                <Volume2 size={10} className="text-emerald-500" />
                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">VO Ready</span>
             </div>
           )}
        </div>

        {/* Actions */}
        <div className={`flex items-center gap-2 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
           <button 
             onClick={onDelete}
             className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
             title="Delete Scene"
           >
             <Trash2 size={14} />
           </button>
           <button className="p-1.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
             <MoreVertical size={14} />
           </button>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        
        {/* Left Col: Narration (The Script) */}
        <div className="p-6 border-b md:border-b-0 md:border-r border-white/5 space-y-3 relative">
           <div className="flex justify-between items-end">
             <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
               <Volume2 size={12} /> Narration
             </label>
             <button className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
               <Wand2 size={10} /> Rewrite
             </button>
           </div>
           <textarea 
             value={scene.audio_text || ''}
             onChange={(e) => onUpdate(scene.id, 'audio_text', e.target.value)}
             className="w-full h-32 bg-transparent text-lg text-slate-200 placeholder-slate-700 focus:outline-none resize-none leading-relaxed font-medium"
             placeholder="Write what the narrator says here..."
           />
        </div>

        {/* Right Col: Visuals (The Shot) */}
        <div className="p-6 space-y-4 bg-black/20">
           
           {/* Visual Description Input */}
           <div className="space-y-2">
             <div className="flex justify-between items-end">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <ImageIcon size={12} /> Visual Direction
                </label>
                <button className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Sparkles size={10} /> Suggest
                </button>
             </div>
             <input 
               type="text"
               value={scene.visual_description || ''}
               onChange={(e) => onUpdate(scene.id, 'visual_description', e.target.value)}
               className="w-full bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-sm text-purple-200 placeholder-purple-900/50 focus:outline-none focus:border-purple-500/50 transition font-medium"
               placeholder="Describe the scene..."
             />
           </div>

           {/* Asset Preview Window */}
           <div className="aspect-video bg-black/40 rounded-xl border border-white/5 overflow-hidden relative group/asset">
              {activeAsset ? (
                <>
                  <img 
                    src={activeAsset.asset_url} 
                    alt="Scene Asset" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/asset:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/asset:opacity-100 transition-opacity flex items-center justify-center gap-2">
                     <button className="px-3 py-1.5 bg-black/80 text-white text-xs font-bold rounded-lg border border-white/10 hover:bg-purple-600 hover:border-purple-500 transition-all">
                       Regenerate
                     </button>
                  </div>
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/60 backdrop-blur rounded text-[9px] font-mono text-white/70">
                    {activeAsset.provider}
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 gap-2 border-2 border-dashed border-white/5 m-0.5 rounded-lg">
                   <ImageIcon size={24} />
                   <span className="text-[10px] font-bold uppercase tracking-widest">No Visual</span>
                </div>
              )}
           </div>

        </div>
      </div>
    </div>
  )
}
