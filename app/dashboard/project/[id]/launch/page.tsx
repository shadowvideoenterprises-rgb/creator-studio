'use client'
import { useState, use } from 'react'
import { Rocket, Youtube, Instagram, Twitter, Download, Copy, Check } from 'lucide-react'

export default function LaunchPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const projectId = resolvedParams.id
  
  const [activeTab, setActiveTab] = useState('youtube')
  const [copied, setCopied] = useState(false)

  // Mock Marketing Data (This would come from your Marketing AI Service)
  const marketing = {
    youtube: {
      title: "The Secret Truth About Pyramids (You Won't Believe This)",
      description: "Stop scrolling. Everything you know about Ancient Egypt is wrong. In this video, we uncover the hidden engineering...",
      tags: "#History #AncientEgypt #Engineering #Mystery #Documentary"
    },
    shorts: {
      title: "Pyramids were POWER PLANTS?? ⚡️ #Shorts",
      description: "Did the ancients have electricity? The answer might shock you. Link in bio.",
      tags: "#Shorts #HistoryFacts #Conspiracy"
    }
  }

  const currentData = activeTab === 'youtube' ? marketing.youtube : marketing.shorts

  const handleCopy = () => {
    navigator.clipboard.writeText(`${currentData.title}\n\n${currentData.description}\n\n${currentData.tags}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExport = async () => {
    const res = await fetch(`/api/export/${projectId}`, { method: 'POST' })
    const json = await res.json()
    const blob = new Blob([JSON.stringify(json.data, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `project_${projectId}_export.json`
    document.body.appendChild(a)
    a.click()
  }

  return (
    <div className="p-8 min-h-screen max-w-6xl mx-auto">
      
      <div className="mb-12 text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-2xl shadow-purple-500/20">
          <Rocket size={32} className="text-white" />
        </div>
        <h1 className="text-4xl font-black text-white">Ready for Liftoff?</h1>
        <p className="text-slate-400 text-lg">Your video is ready. Let's package it for the world.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Platform Selector */}
        <div className="lg:col-span-1 space-y-3">
           <p className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2 mb-2">Select Platform</p>
           
           <button 
             onClick={() => setActiveTab('youtube')}
             className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all ${activeTab === 'youtube' ? 'bg-[#FF0000]/10 border border-[#FF0000]/20 text-white' : 'bg-[#121214] border border-white/5 text-slate-400 hover:bg-white/5'}`}
           >
             <Youtube className={activeTab === 'youtube' ? 'text-[#FF0000]' : 'text-slate-500'} />
             <span className="font-bold">YouTube Main</span>
           </button>

           <button 
             onClick={() => setActiveTab('shorts')}
             className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all ${activeTab === 'shorts' ? 'bg-pink-500/10 border border-pink-500/20 text-white' : 'bg-[#121214] border border-white/5 text-slate-400 hover:bg-white/5'}`}
           >
             <Instagram className={activeTab === 'shorts' ? 'text-pink-500' : 'text-slate-500'} />
             <span className="font-bold">Shorts / Reels</span>
           </button>
           
           <div className="pt-8">
             <button 
               onClick={handleExport}
               className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-purple-200 transition-all flex items-center justify-center gap-2"
             >
               <Download size={18} />
               <span>Download Project JSON</span>
             </button>
           </div>
        </div>

        {/* Right: Metadata Editor */}
        <div className="lg:col-span-2 bg-[#121214] border border-white/5 rounded-3xl p-8 relative">
           
           <div className="absolute top-6 right-6">
              <button 
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-bold text-slate-300 hover:bg-white/10 transition-all"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                <span>{copied ? 'Copied!' : 'Copy Details'}</span>
              </button>
           </div>

           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Video Title</label>
                 <input 
                   type="text" 
                   defaultValue={currentData?.title}
                   className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white font-bold text-lg focus:outline-none focus:border-purple-500/50"
                 />
              </div>

              <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description</label>
                 <textarea 
                   defaultValue={currentData?.description}
                   className="w-full h-40 bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-slate-300 leading-relaxed focus:outline-none focus:border-purple-500/50 resize-none"
                 />
              </div>

              <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tags</label>
                 <div className="flex flex-wrap gap-2">
                    {currentData?.tags.split(' ').map((tag, i) => (
                      <span key={i} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-sm font-medium">
                        {tag}
                      </span>
                    ))}
                 </div>
              </div>
           </div>

        </div>

      </div>
    </div>
  )
}
