'use client'
import { Scene } from '@/lib/types'
import { Trash2, Sparkles, Image as ImageIcon, Volume2 } from 'lucide-react'

interface SceneEditorProps {
  scene: Scene
  onUpdate: (id: string, field: string, value: string) => void
  onDelete: () => void
}

export default function SceneEditor({ scene, onUpdate, onDelete }: SceneEditorProps) {
  // Filter for Visuals vs Audio
  const visuals = scene.scene_assets?.filter(a => a.asset_type !== 'audio') || [];
  const audios = scene.scene_assets?.filter(a => a.asset_type === 'audio') || [];
  
  const activeAsset = visuals.length > 0 ? visuals[0] : null;
  const hasAudio = audios.length > 0;

  return (
    <div className="flex gap-6 bg-[#121214] border border-white/5 p-6 rounded-3xl relative group transition-all hover:border-white/10">
      
      {/* 1. Left Side: Script & Controls */}
      <div className="flex-1 space-y-6">
        <div className="flex items-center gap-3">
           <div className="w-6 h-6 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-black tracking-widest">
             {scene.sequence_order}
           </div>
           <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Scene {scene.sequence_order}</span>
           
           {/* NEW: Audio Indicator */}
           {hasAudio && (
             <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <Volume2 size={10} className="text-emerald-500" />
                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Voiceover Ready</span>
             </div>
           )}
        </div>

        <div className="space-y-2">
           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Narration</label>
           <textarea 
             value={scene.audio_text || ''}
             onChange={(e) => onUpdate(scene.id, 'audio_text', e.target.value)}
             className="w-full bg-black/20 border border-white/5 rounded-xl p-4 text-slate-200 text-sm focus:outline-none focus:border-purple-500/50 transition resize-none h-24"
           />
        </div>

        <div className="space-y-2">
           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Visual Direction</label>
           <div className="flex items-center gap-3 bg-black/20 border border-white/5 rounded-xl p-3">
             <Sparkles size={14} className="text-purple-400 shrink-0" />
             <input 
               type="text"
               value={scene.visual_description || ''}
               onChange={(e) => onUpdate(scene.id, 'visual_description', e.target.value)}
               className="w-full bg-transparent text-sm text-purple-200 placeholder-purple-900/50 focus:outline-none font-medium"
             />
           </div>
        </div>
      </div>

      {/* 2. Right Side: The Asset Viewer */}
      <div className="w-[400px] shrink-0">
         <div className="aspect-video bg-black/40 rounded-2xl border border-white/5 overflow-hidden relative group/asset">
            {activeAsset ? (
              <>
                <img 
                  src={activeAsset.asset_url} 
                  alt="Scene Asset" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover/asset:opacity-100 transition-opacity">
                   <p className="text-[10px] text-white font-mono truncate">{activeAsset.provider || 'AI Generated'}</p>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-2">
                 <ImageIcon size={32} />
                 <span className="text-xs font-bold uppercase tracking-widest">No Asset Generated</span>
              </div>
            )}
         </div>
      </div>

      <button onClick={onDelete} className="absolute top-4 right-4 p-2 text-slate-700 hover:text-red-500 hover:bg-red-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-all">
        <Trash2 size={16} />
      </button>

    </div>
  )
}
