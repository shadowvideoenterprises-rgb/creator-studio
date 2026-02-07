'use client'
import { useState } from 'react'
import { Palette, Mic2, RefreshCw, Layers } from 'lucide-react'
import { useToast } from '@/components/ToastProvider'

interface BatchToolbarProps {
  projectId: string
  onUpdate: () => void
}

export function BatchToolbar({ projectId, onUpdate }: BatchToolbarProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleStyleSwap = async (style: string) => {
    setLoading(true)
    toast(`Applying ${style} style to all scenes...`, "loading")
    try {
        const res = await fetch('/api/project/batch', {
            method: 'POST',
            body: JSON.stringify({ action: 'update_style', projectId, payload: { style } })
        })
        if (res.ok) {
            toast("Styles Updated! Now click 'Generate All'.", "success")
            onUpdate()
        }
    } catch (e) { toast("Batch Failed", "error") }
    setLoading(false)
  }

  if (!isOpen) {
      return (
          <button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 px-4 py-3 bg-white text-black font-bold rounded-full shadow-2xl flex items-center gap-2 hover:scale-105 transition-transform z-50">
              <Layers size={18} /> Director Tools
          </button>
      )
  }

  return (
    <div className="fixed bottom-6 right-6 bg-[#1a1a20] border border-white/10 p-4 rounded-2xl shadow-2xl z-50 animate-in slide-in-from-bottom-4 w-72">
       <div className="flex justify-between items-center mb-4">
           <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Global Actions</span>
           <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white">&times;</button>
       </div>
       
       <div className="space-y-3">
           <div>
               <label className="text-xs text-slate-400 mb-1 block flex items-center gap-1"><Palette size={12}/> Swap Visual Style</label>
               <div className="grid grid-cols-2 gap-2">
                   {['Cinematic', 'Anime', 'Watercolor', 'Cyberpunk'].map(s => (
                       <button key={s} disabled={loading} onClick={() => handleStyleSwap(s)} className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] text-white border border-white/5 transition-colors">
                           {s}
                       </button>
                   ))}
               </div>
           </div>

           <div className="pt-3 border-t border-white/5">
                <label className="text-xs text-slate-400 mb-1 block flex items-center gap-1"><Mic2 size={12}/> Swap Voice</label>
                <select className="w-full bg-black border border-white/10 rounded px-2 py-1 text-xs text-slate-300 outline-none">
                    <option>Rachel (Energetic)</option>
                    <option>Adam (Deep)</option>
                    <option>ElevenLabs Default</option>
                </select>
           </div>
       </div>
    </div>
  )
}
