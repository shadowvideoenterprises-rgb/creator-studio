'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Trash2, Film, Type, Search, ImageIcon } from 'lucide-react'
import MediaModal from '../media/MediaModal'

export default function SceneEditor({ scene, onUpdate, onDelete }: any) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [showMediaModal, setShowMediaModal] = useState(false)

  const handleBlur = async (field: string, value: string) => {
    setIsUpdating(true)
    const { error } = await supabase
      .from('scenes')
      .update({ [field]: value })
      .eq('id', scene.id)
    
    if (!error) onUpdate(scene.id, field, value)
    setIsUpdating(false)
  }

  return (
    <div className="group bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 transition-all hover:border-purple-500/30 shadow-2xl relative overflow-hidden">
      {/* Background Glow for Active Assets */}
      {scene.asset_url && (
        <div className="absolute inset-0 opacity-5 pointer-events-none">
           <img src={scene.asset_url} className="w-full h-full object-cover blur-3xl" alt="" />
        </div>
      )}

      <div className="flex justify-between items-center mb-6 relative">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
          Scene {scene.sequence_order}
        </span>
        <button onClick={() => onDelete(scene.id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-red-400 transition-all">
          <Trash2 size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative">
        {/* Audio/Script Side */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-[10px] font-bold text-purple-400 uppercase tracking-widest ml-1">
            <Type size={14} /> Audio Script
          </label>
          <textarea 
            defaultValue={scene.audio_text}
            onBlur={(e) => handleBlur('audio_text', e.target.value)}
            className="w-full h-40 bg-black/40 border border-white/5 rounded-2xl p-5 text-sm leading-relaxed focus:border-purple-500/50 outline-none transition-all resize-none shadow-inner text-slate-200"
            placeholder="What should be said in this scene?"
          />
        </div>

        {/* Visual/Media Side */}
        <div className="space-y-3">
          <div className="flex justify-between items-center ml-1">
            <label className="flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
              <Film size={14} /> Visual Direction
            </label>
            <button 
              onClick={() => setShowMediaModal(true)}
              className="flex items-center gap-2 text-[10px] font-bold text-white/40 hover:text-blue-400 uppercase tracking-widest transition-colors"
            >
              <Search size={12} /> Search Media
            </button>
          </div>

          <div className="relative group/media h-40">
            {scene.asset_url ? (
              <div className="relative h-full w-full rounded-2xl overflow-hidden border border-white/10 group-hover:border-blue-500/50 transition-all">
                <img src={scene.asset_url} className="w-full h-full object-cover" alt="Selected asset" />
                <button 
                   onClick={() => setShowMediaModal(true)}
                   className="absolute inset-0 bg-black/60 opacity-0 group-hover/media:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2"
                >
                  <ImageIcon size={24} className="text-white" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white">Change Media</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowMediaModal(true)}
                className="w-full h-full bg-black/40 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-blue-500/20 hover:bg-blue-500/[0.02] transition-all group"
              >
                <div className="p-3 bg-white/5 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                  <Search size={20} className="text-slate-500 group-hover:text-blue-400" />
                </div>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Add Visual Asset</span>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {isUpdating && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full">
           <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse" />
           <span className="text-[8px] font-bold text-purple-400 uppercase tracking-widest">Syncing to Cloud</span>
        </div>
      )}

      {showMediaModal && (
        <MediaModal 
          sceneId={scene.id} 
          onClose={() => setShowMediaModal(false)}
          onSelect={(id: string, url: string) => onUpdate(id, 'asset_url', url)}
        />
      )}
    </div>
  )
}