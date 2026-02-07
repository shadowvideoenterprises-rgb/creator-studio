'use client'
import { useState } from 'react'
import { Clock, GripVertical, Image as ImageIcon, Mic } from 'lucide-react'
import { useToast } from '@/components/ToastProvider'

interface TimelineProps {
  scenes: any[]
  onReorder: (sceneId: string, newIndex: number) => void
}

export function Timeline({ scenes, onReorder }: TimelineProps) {
  const { toast } = useToast()
  const [draggedId, setDraggedId] = useState<string | null>(null)

  // Simple Drag Logic
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    if (!draggedId) return
    onReorder(draggedId, targetIndex)
    setDraggedId(null)
  }

  const totalDuration = scenes.reduce((acc, s) => acc + (s.estimated_duration || 5), 0)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      
      {/* Time Ruler */}
      <div className="flex justify-between items-end px-2">
         <div className="text-slate-500 font-mono text-xs uppercase">00:00</div>
         <div className="text-slate-500 font-mono text-xs uppercase">Total: ~{Math.floor(totalDuration / 60)}m {totalDuration % 60}s</div>
      </div>

      {/* The Track */}
      <div className="relative w-full h-40 bg-[#121214] border border-white/5 rounded-xl overflow-hidden flex overflow-x-auto custom-scrollbar">
        {scenes.map((scene, index) => {
           // Calculate relative width (min 100px)
           const duration = scene.estimated_duration || 5
           const width = Math.max(120, duration * 20) 
           
           return (
             <div 
               key={scene.id}
               draggable
               onDragStart={(e) => handleDragStart(e, scene.id)}
               onDragOver={(e) => e.preventDefault()}
               onDrop={(e) => handleDrop(e, index)}
               className={`relative h-full border-r border-white/10 group cursor-grab active:cursor-grabbing hover:bg-white/5 transition-colors flex flex-col`}
               style={{ minWidth: `${width}px`, width: `${width}px` }}
             >
                {/* Header Bar */}
                <div className="h-6 bg-white/5 border-b border-white/5 flex items-center justify-between px-2">
                    <span className="text-[10px] font-bold text-slate-500 font-mono">{index + 1}</span>
                    <GripVertical size={12} className="text-slate-600" />
                </div>

                {/* Content */}
                <div className="flex-1 p-2 flex flex-col gap-2">
                    {/* Visual Preview */}
                    <div className="flex-1 bg-black/40 rounded overflow-hidden relative">
                        {scene.image_url ? (
                            <img src={scene.image_url} className="w-full h-full object-cover opacity-50" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center"><ImageIcon size={14} className="text-slate-700"/></div>
                        )}
                        <div className="absolute bottom-1 right-1 text-[9px] font-mono bg-black/60 px-1 rounded text-slate-300">
                           {duration}s
                        </div>
                    </div>
                    {/* Audio Preview */}
                    <div className="h-6 bg-indigo-500/10 border border-indigo-500/20 rounded flex items-center px-2 gap-1">
                        <Mic size={10} className="text-indigo-400" />
                        <span className="text-[9px] text-indigo-300 truncate">{scene.audio_text}</span>
                    </div>
                </div>
             </div>
           )
        })}
      </div>

      <div className="text-center text-xs text-slate-600 italic">
        Drag scenes to reorder the narrative flow.
      </div>
    </div>
  )
}
