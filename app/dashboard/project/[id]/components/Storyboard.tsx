'use client'
import { useState } from 'react'
import { Image as ImageIcon, Mic, Clock, Star, TrendingUp, RefreshCw } from 'lucide-react'

interface StoryboardProps {
  scenes: any[]
  onRegenerate: (sceneId: string, type: 'visual' | 'audio') => void
}

export function Storyboard({ scenes, onRegenerate }: StoryboardProps) {
  const [hovered, setHovered] = useState<string | null>(null)

  if (!scenes || scenes.length === 0) return (
    <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-3xl bg-white/5">
        <h3 className="text-xl font-bold text-slate-400">Empty Storyboard</h3>
        <p className="text-sm text-slate-500 mt-2">Generate a script to see scenes here.</p>
    </div>
  )

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
    if (score >= 6) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
    return 'text-red-400 bg-red-400/10 border-red-400/20'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
      {scenes.map((scene) => (
        <div 
            key={scene.id} 
            id={`scene-${scene.id}`} // LINK ID FOR TIMELINE SCROLLING
            className="group relative bg-[#121214] border border-white/5 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all duration-300 scroll-mt-24"
            onMouseEnter={() => setHovered(scene.id)}
            onMouseLeave={() => setHovered(null)}
        >
          {/* HEADER: Sequence & DURATION */}
          <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
             <span className="bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-md border border-white/10">
                #{scene.sequence_order}
             </span>
             {scene.estimated_duration && (
                 <span className={`text-[10px] font-bold px-2 py-1 rounded-md border backdrop-blur-md flex items-center gap-1 ${scene.estimated_duration > 12 ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-black/60 text-slate-300 border-white/10'}`}>
                    <Clock size={10} /> {scene.estimated_duration}s
                 </span>
             )}
          </div>

          {/* QUALITY BADGE (Top Right) */}
          {scene.quality_score && (
            <div className={`absolute top-3 right-3 z-20 flex items-center gap-1 px-2 py-1 rounded-md border backdrop-blur-md text-[10px] font-bold ${getScoreColor(scene.quality_score)}`}>
                <TrendingUp size={10} /> {scene.quality_score}
            </div>
          )}

          {/* VISUAL AREA */}
          <div className="aspect-video bg-[#0a0a0a] relative group/image">
             {scene.image_url ? (
                 <img src={scene.image_url} alt="Scene" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
             ) : (
                 <div className="w-full h-full flex items-center justify-center text-slate-700">
                    <ImageIcon size={32} />
                 </div>
             )}
             
             {/* Hover Overlay */}
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center gap-4 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300">
                <button 
                    onClick={(e) => { e.stopPropagation(); onRegenerate(scene.id, 'visual'); }} 
                    className="p-3 bg-indigo-600 rounded-full hover:bg-indigo-500 text-white shadow-lg transition-transform hover:scale-110 flex items-center gap-2"
                    title="Regenerate Image"
                >
                    <RefreshCw size={16} /> <span className="text-xs font-bold">New Image</span>
                </button>
             </div>
          </div>

          {/* SCRIPT AREA */}
          <div className="p-4 space-y-3">
             <div className="p-3 bg-white/5 rounded-xl border border-white/5 relative group/text hover:bg-white/10 transition-colors">
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 group-hover/text:line-clamp-none transition-all">
                    "{scene.audio_text}"
                </p>
                {/* Visual Potential Star */}
                {scene.visual_potential && (
                    <div className="absolute -top-2 -right-2 bg-black border border-white/10 rounded-full p-1 text-[10px] text-purple-400" title={`Visual Potential: ${scene.visual_potential}/10`}>
                        <Star size={10} fill="currentColor" />
                    </div>
                )}
             </div>
             
             {/* AUDIO STATUS */}
             <div className="flex justify-between items-center pt-2 border-t border-white/5">
                 <div className="flex items-center gap-2">
                    {scene.audio_url ? (
                        <span className="text-xs text-emerald-400 flex items-center gap-1 font-bold"><Mic size={12}/> Voice Ready</span>
                    ) : (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onRegenerate(scene.id, 'audio'); }}
                            className="text-xs text-slate-500 hover:text-white flex items-center gap-1 transition-colors"
                        >
                            <Mic size={12}/> Generate Voice
                        </button>
                    )}
                 </div>
                 
                 {/* Quick Actions (Future) */}
                 <div className="text-[10px] text-slate-600 font-mono">
                    ID: {scene.id.substring(0,4)}
                 </div>
             </div>
          </div>
        </div>
      ))}
    </div>
  )
}
