'use client'
import { useState } from 'react'
import { Lightbulb, TrendingUp, ArrowRight, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ToastProvider'

interface ConceptPickerProps {
  userId: string
  onSelect: (title: string) => void
}

export function ConceptPicker({ userId, onSelect }: ConceptPickerProps) {
  const { toast } = useToast()
  const [topic, setTopic] = useState('')
  const [concepts, setConcepts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const generateConcepts = async () => {
    if (!topic) return;
    setLoading(true);
    try {
        const res = await fetch('/api/generate/concepts', {
            method: 'POST',
            body: JSON.stringify({ topic, userId })
        });
        const data = await res.json();
        if (data.success) {
            setConcepts(data.concepts.sort((a: any, b: any) => b.score - a.score));
        } else {
            toast(data.error || "Failed to generate", "error");
        }
    } catch (e) {
        toast("Network error", "error");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
        {/* Input Area */}
        <div className="flex gap-4">
            <input 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter a broad topic (e.g., 'Coffee', 'Space Travel')..."
                className="flex-1 bg-[#121214] border border-white/10 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && generateConcepts()}
            />
            <button 
                onClick={generateConcepts}
                disabled={loading || !topic}
                className="px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-2 disabled:opacity-50 transition-all"
            >
                {loading ? <Loader2 className="animate-spin" /> : <Lightbulb />}
                Brainstorm
            </button>
        </div>

        {/* Results Area */}
        {concepts.length > 0 && (
            <div className="grid grid-cols-1 gap-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Top Viral Angles</div>
                {concepts.map((c, i) => (
                    <div 
                        key={i} 
                        onClick={() => onSelect(c.title)}
                        className="group bg-[#121214] border border-white/5 p-4 rounded-xl cursor-pointer hover:border-indigo-500/50 hover:bg-white/5 transition-all relative overflow-hidden"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors">{c.title}</h3>
                            <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${c.score >= 9 ? 'bg-emerald-500/20 text-emerald-400' : c.score >= 7 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-500/20 text-slate-400'}`}>
                                <TrendingUp size={12} /> {c.score}/10
                            </div>
                        </div>
                        <p className="text-sm text-slate-400 mb-3">{c.hook}</p>
                        
                        <div className="flex items-center text-xs text-indigo-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
                            Use this concept <ArrowRight size={12} className="ml-1" />
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  )
}
