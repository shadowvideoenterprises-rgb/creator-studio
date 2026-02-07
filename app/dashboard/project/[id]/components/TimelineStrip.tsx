'use client'
import { useState } from 'react'
import { Clock, GripVertical } from 'lucide-react'

interface TimelineProps {
  scenes: any[]
  totalDuration: number
  onSelectScene: (id: string) => void
}

export function TimelineStrip({ scenes, totalDuration, onSelectScene }: TimelineProps) {
  const [hoveredScene, setHoveredScene] = useState<string | null>(null)

  if (!scenes || scenes.length === 0) return null

  // Ensure total duration isn't 0 to avoid division by zero
  const safeTotal = totalDuration || 60; 

  return (
    <div className="w-full bg-[#121214] border-b border-white/10 p-4">
       <div className="flex justify-between items-center mb-2 px-1">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
             <Clock size={12} /> Timeline ({safeTotal}s)
          </div>
          <div className="text-[10px] text-slate-600">
             Video Flow
          </div>
       </div>

       {/* The Strip */}
       <div className="flex w-full h-24 bg-black/50 rounded-lg overflow-hidden border border-white/5 relative">
          {scenes.map((scene, index) => {
             // Calculate width percentage based on duration
             const duration = scene.estimated_duration || 5;
             const widthPct = (duration / safeTotal) * 100;
             
             return (
                <div 
                   key={scene.id}
                   style={{ width: `${widthPct}%` }}
                   className={`relative border-r border-black/50 cursor-pointer transition-all hover:brightness-125 group ${index % 2 === 0 ? 'bg-indigo-900/20' : 'bg-indigo-800/20'}`}
                   onClick={() => onSelectScene(scene.id)}
                   onMouseEnter={() => setHoveredScene(scene.id)}
                   onMouseLeave={() => setHoveredScene(null)}
                >
                   {/* Background Image Preview (faded) */}
                   {scene.image_url && (
                       <div 
                         className="absolute inset-0 opacity-30 bg-cover bg-center grayscale group-hover:grayscale-0 transition-all"
                         style={{ backgroundImage: `url(${scene.image_url})` }}
                       />
                   )}

                   {/* Content */}
                   <div className="absolute inset-0 flex flex-col justify-between p-2">
                      <div className="flex justify-between items-start">
                         <span className="text-[10px] font-bold bg-black/50 px-1 rounded text-white">#{scene.sequence_order}</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 self-end bg-black/50 px-1 rounded">
                         {duration}s
                      </div>
                   </div>

                   {/* Hover Tooltip */}
                   {hoveredScene === scene.id && (
                       <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-800 text-white text-xs p-2 rounded shadow-xl z-50 pointer-events-none">
                          <p className="line-clamp-2 italic">"{scene.audio_text}"</p>
                       </div>
                   )}
                </div>
             )
          })}
       </div>
       
       {/* Time Markers */}
       <div className="flex justify-between mt-1 text-[10px] text-slate-600 font-mono px-1">
          <span>00:00</span>
          <span>00:{Math.floor(safeTotal / 2)}</span>
          <span>01:{safeTotal % 60}</span>
       </div>
    </div>
  )
}
