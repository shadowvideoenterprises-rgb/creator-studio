'use client'
import { useState } from 'react'
import { Scene, SceneAsset } from '@/lib/types'
import { supabase } from '@/lib/supabaseClient'
import { Trash2, GripVertical, Image as ImageIcon, Video, Wand2, RefreshCw, Volume2 } from 'lucide-react'

interface SceneEditorProps {
  scene: Scene
  onUpdate: (id: string, field: string, value: string) => void
  onDelete: () => void
}

export default function SceneEditor({ scene, onUpdate, onDelete }: SceneEditorProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  // Determine the active asset
  const activeAsset = scene.assets?.find(a => a.is_selected) || scene.assets?.[0]

  const handleSelectAsset = async (asset: SceneAsset) => {
    if (isUpdating) return
    setIsUpdating(true)
    await supabase.from('scene_assets').update({ is_selected: false }).eq('scene_id', scene.id)
    await supabase.from('scene_assets').update({ is_selected: true }).eq('id', asset.id)
    setIsUpdating(false)
    onDelete() 
  }

  return (
    <div className="bg-[#121214] border border-white/5 rounded-3xl p-6 group hover:border-white/10 transition-all flex gap-8 relative overflow-hidden">
       <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

       {/* Left: Scripting Controls */}
       <div className="flex-1 space-y-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="cursor-move text-white/20 hover:text-white transition">
              <GripVertical size={20} />
            </div>
            <span className="font-mono text-xs text-purple-400 font-bold uppercase tracking-widest bg-purple-500/10 px-2 py-1 rounded">Scene {scene.sequence_order}</span>
            
            {/* NEW: Audio Player Indicator */}
            {scene.audio_url && (
              <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                <Volume2 size={12} className="text-emerald-500" />
                <span className="text-[10px] text-emerald-500 font-bold uppercase">Voice Ready</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Narration (Voiceover)</label>
            <textarea 
              value={scene.audio_text} 
              onChange={(e) => onUpdate(scene.id, 'audio_text', e.target.value)}
              className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-slate-300 text-sm leading-relaxed outline-none focus:border-purple-500/50 focus:bg-black/60 transition resize-none h-24"
              placeholder="Enter the voiceover script here..."
            />
            {/* NEW: Actual Audio Player */}
            {scene.audio_url && (
               <audio controls className="w-full h-8 mt-2 opacity-60 hover:opacity-100 transition-opacity" src={scene.audio_url} />
            )}
          </div>

          <div className="space-y-2">
             <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Visual Direction</label>
             <div className="relative">
                <Wand2 size={14} className="absolute top-4 left-4 text-purple-400" />
                <textarea 
                  value={scene.visual_description} 
                  onChange={(e) => onUpdate(scene.id, 'visual_description', e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-xl p-4 pl-12 text-slate-400 text-sm leading-relaxed outline-none focus:border-indigo-500/50 focus:bg-black/60 transition resize-none h-20 font-mono"
                />
             </div>
          </div>
       </div>

       {/* Right: Asset Selector */}
       <div className="w-[400px] flex flex-col gap-4">
          <div className="aspect-video bg-black rounded-2xl border border-white/5 relative overflow-hidden group/preview shadow-2xl">
            {activeAsset ? (
               activeAsset.type === 'stock' && activeAsset.url.endsWith('.mp4') ? (
                 <video src={activeAsset.url} className="w-full h-full object-cover" autoPlay loop muted playsInline />
               ) : (
                 <img src={activeAsset.url} className="w-full h-full object-cover" alt="Scene Asset" />
               )
            ) : (
               <div className="w-full h-full flex flex-col items-center justify-center text-white/20 gap-3">
                  <ImageIcon size={32} />
                  <span className="text-xs uppercase tracking-widest">No Asset Generated</span>
               </div>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
             {scene.assets?.map((asset) => (
               <button 
                 key={asset.id}
                 onClick={() => handleSelectAsset(asset)}
                 className={`aspect-video rounded-lg overflow-hidden border-2 relative transition-all active:scale-95 ${
                    asset.is_selected ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-transparent hover:border-white/20 opacity-60 hover:opacity-100'
                 }`}
               >
                 <img src={activeAsset?.url === asset.url ? asset.url : asset.url} className="w-full h-full object-cover" />
               </button>
             ))}
          </div>
       </div>

       <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
         <button onClick={onDelete} className="p-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition">
           <Trash2 size={18} />
         </button>
       </div>
    </div>
  )
}
