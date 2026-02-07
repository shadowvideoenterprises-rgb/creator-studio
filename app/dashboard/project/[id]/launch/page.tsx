'use client'
import { useState, useEffect, use } from 'react'
import { Rocket, Youtube, Instagram, Download, Copy, Check, Sparkles, Loader2, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from '@/components/ToastProvider'

export default function LaunchPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const projectId = resolvedParams.id
  const { toast } = useToast()
  
  const [activeTab, setActiveTab] = useState('youtube')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [project, setProject] = useState<any>(null)
  
  // Real Data State
  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    tags: [] as string[]
  })

  useEffect(() => { fetchProject() }, [])

  const fetchProject = async () => {
    const { data } = await supabase.from('projects').select('*').eq('id', projectId).single()
    if (data) {
        setProject(data)
        // Load existing data or fallbacks
        setMetadata({
            title: data.title || '',
            description: data.description || '',
            tags: data.tags || [] // Ensure your DB has a tags column or use a JSON field
        })
    }
    setLoading(false)
  }

  const handleGenerate = async () => {
    setGenerating(true)
    toast("AI Growth Expert is analyzing your script...", "loading", 4000)
    
    try {
        const res = await fetch('/api/generate/marketing', {
            method: 'POST',
            body: JSON.stringify({ projectId })
        })
        const json = await res.json()
        
        if (json.success) {
            setMetadata({
                title: json.data.title,
                description: json.data.description,
                tags: json.data.tags
            })
            toast("Viral Metadata Generated!", "success")
            fetchProject() // Refresh to sync
        } else {
            toast(json.error || "Generation Failed", "error")
        }
    } catch (e) {
        toast("Network Error", "error")
    } finally {
        setGenerating(false)
    }
  }

  const handleCopy = () => {
    const text = `${metadata.title}\n\n${metadata.description}\n\nTags: ${metadata.tags.join(', ')}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast("Copied to clipboard", "success")
  }

  const handleExport = async () => {
    toast("Packaging project...", "loading")
    try {
        const res = await fetch(`/api/export?projectId=${projectId}`) // Using the GET route from snapshot
        if (!res.ok) throw new Error("Export failed")
        
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${metadata.title.slice(0, 20).replace(/\s+/g, '_')}_Bible.md` // Downloading the Bible for now
        document.body.appendChild(a)
        a.click()
        toast("Download Started", "success")
    } catch (e) {
        toast("Export failed", "error")
    }
  }

  if (loading) return <div className="p-20 text-center text-slate-500">Loading Launchpad...</div>

  return (
    <div className="p-8 min-h-screen max-w-6xl mx-auto animate-in fade-in">
      
      <div className="mb-12 text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-2xl shadow-purple-500/20">
          <Rocket size={32} className="text-white" />
        </div>
        <h1 className="text-4xl font-black text-white">Ready for Liftoff?</h1>
        <p className="text-slate-400 text-lg">Your video is ready. Let's package it for the world.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Platform Selector & Actions */}
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
           
           <div className="pt-8 space-y-3">
             <button 
               onClick={handleGenerate}
               disabled={generating}
               className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20 disabled:opacity-50"
             >
               {generating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
               <span>{generating ? 'Analyzing...' : 'Auto-Generate Metadata'}</span>
             </button>

             <button 
               onClick={handleExport}
               className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
             >
               <Download size={18} />
               <span>Download Package</span>
             </button>
           </div>
        </div>

        {/* Right: Metadata Editor */}
        <div className="lg:col-span-2 bg-[#121214] border border-white/5 rounded-3xl p-8 relative group">
           
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
                 <div className="relative">
                    <input 
                       type="text" 
                       value={metadata.title}
                       onChange={(e) => setMetadata({...metadata, title: e.target.value})}
                       className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white font-bold text-lg focus:outline-none focus:border-indigo-500/50 pr-12"
                       placeholder="Click Auto-Generate..."
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-600">
                        {metadata.title.length}/60
                    </div>
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description</label>
                 <textarea 
                   value={metadata.description}
                   onChange={(e) => setMetadata({...metadata, description: e.target.value})}
                   className="w-full h-40 bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-slate-300 leading-relaxed focus:outline-none focus:border-indigo-500/50 resize-none font-mono text-sm"
                   placeholder="AI will generate a viral description here..."
                 />
              </div>

              <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tags</label>
                 <div className="flex flex-wrap gap-2">
                     {metadata.tags.length > 0 ? (
                        metadata.tags.map((tag, i) => (
                          <span key={i} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-sm font-medium">
                            #{tag}
                          </span>
                        ))
                     ) : (
                        <span className="text-slate-600 text-sm italic">No tags generated yet.</span>
                     )}
                 </div>
              </div>
           </div>

        </div>

      </div>
    </div>
  )
}
