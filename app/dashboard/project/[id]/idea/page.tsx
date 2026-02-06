'use client'
import { useState, use } from 'react'
import { Sparkles, ArrowRight, Target, TrendingUp, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function IdeaLab({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const projectId = resolvedParams.id
  const router = useRouter()

  const [topic, setTopic] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [concepts, setConcepts] = useState<any[]>([])

  // Mock AI Brainstorming
  const generateConcepts = async () => {
    if (!topic) return
    setIsGenerating(true)
    
    // Simulate AI thinking time
    await new Promise(r => setTimeout(r, 1500))

    // Mock Response
    setConcepts([
      {
        title: `The Secret Truth About ${topic}`,
        hook: "Stop scrolling. Everything you know about this is wrong.",
        score: 92,
        angle: "Controversial / Mystery"
      },
      {
        title: `Why ${topic} Will Change Everything in 2026`,
        hook: "If you're ignoring this, you're falling behind.",
        score: 88,
        angle: "Future / Trend"
      },
      {
        title: `${topic}: A Complete Breakdown`,
        hook: "I spent 100 hours researching so you don't have to.",
        score: 85,
        angle: "Educational / Deep Dive"
      }
    ])
    setIsGenerating(false)
  }

  const selectConcept = async (concept: any) => {
    // 1. Update the Project in Supabase
    const { error } = await supabase
      .from('projects')
      .update({
        title: concept.title,
        description: `Angle: ${concept.angle}\nHook: ${concept.hook}`
      })
      .eq('id', projectId)

    if (error) alert('Error saving concept')
    else {
      // 2. Move to Script Phase
      router.push(`/dashboard/project/${projectId}`)
    }
  }

  return (
    <div className="p-12 max-w-5xl mx-auto min-h-screen">
      
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
          <Target className="text-purple-500" size={32} />
          Idea Lab
        </h1>
        <p className="text-slate-400 text-lg">Brainstorm viral angles before you write a single word.</p>
      </div>

      {/* Input Section */}
      <div className="bg-[#121214] border border-white/5 p-8 rounded-3xl mb-12">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">What is your video about?</label>
        <div className="flex gap-4">
          <input 
            type="text" 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Ancient Rome, Quantum Physics, Bitcoin..."
            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-6 text-xl text-white focus:outline-none focus:border-purple-500/50 transition h-16"
            onKeyDown={(e) => e.key === 'Enter' && generateConcepts()}
          />
          <button 
            onClick={generateConcepts}
            disabled={!topic || isGenerating}
            className="px-8 h-16 bg-white text-black font-bold rounded-xl hover:bg-purple-400 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? <RefreshCw className="animate-spin" /> : <Sparkles />}
            <span>Generate</span>
          </button>
        </div>
      </div>

      {/* Results Grid */}
      {concepts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-5 duration-500">
          {concepts.map((c, i) => (
            <div key={i} className="group relative bg-[#121214] border border-white/5 p-6 rounded-3xl hover:border-purple-500/50 transition-all hover:-translate-y-1">
              
              {/* Score Badge */}
              <div className="absolute top-6 right-6 flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <TrendingUp size={12} className="text-emerald-500" />
                <span className="text-xs font-bold text-emerald-500">{c.score}</span>
              </div>

              <div className="mb-6">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">{c.angle}</span>
                <h3 className="text-xl font-bold text-white mt-2 leading-tight">{c.title}</h3>
              </div>

              <div className="bg-black/20 p-4 rounded-xl border border-white/5 mb-6">
                <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Opening Hook</span>
                <p className="text-slate-300 italic">"{c.hook}"</p>
              </div>

              <button 
                onClick={() => selectConcept(c)}
                className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-slate-300 font-bold hover:bg-purple-500 hover:text-white hover:border-purple-500 transition-all flex items-center justify-center gap-2"
              >
                <span>Use This Concept</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
