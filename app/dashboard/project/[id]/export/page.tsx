'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { ArrowLeft, Download, Film, Settings, Loader2, CheckCircle } from 'lucide-react'
import LaunchPad from '@/components/launch/LaunchPad'

export default function ExportStudio({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<any>(null)
  const [status, setStatus] = useState<'idle' | 'exporting' | 'complete'>('idle')

  useEffect(() => {
    const fetchProject = async () => {
      const { data } = await supabase.from('projects').select('*').eq('id', params.id).single()
      setProject(data)
    }
    fetchProject()
  }, [params.id])

  const triggerExport = () => {
    setStatus('exporting')
    setTimeout(() => setStatus('complete'), 3500)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex items-center justify-between mb-12">
        <div className="flex items-center gap-5">
          <Link href={`/dashboard/project/${params.id}`} className="p-2.5 hover:bg-white/5 rounded-full border border-white/10 transition">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Export Studio</h1>
            <p className="text-xs font-mono text-purple-400 uppercase tracking-widest mt-1">{project?.title || 'Loading...'}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Visuals & Marketing */}
        <div className="lg:col-span-8 space-y-12">
          {/* Mock Video Preview */}
          <div className="bg-black rounded-[2.5rem] border border-white/5 aspect-video flex flex-col items-center justify-center relative shadow-2xl overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 animate-pulse" />
             <Film size={56} className="text-white/5 mb-4 relative z-10" />
             <span className="text-white/20 font-mono text-[10px] uppercase tracking-[0.3em] relative z-10">Render Engine Active</span>
          </div>

          {/* Launch Pad (The SEO Brain) */}
          <LaunchPad projectId={params.id} />
        </div>

        {/* Right Column: Export Settings */}
        <div className="lg:col-span-4">
          <div className="bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 space-y-8 backdrop-blur-3xl sticky top-8">
            <div className="flex items-center gap-3 text-slate-400">
              <Settings size={18} />
              <h2 className="font-bold uppercase text-xs tracking-widest">Master Settings</h2>
            </div>

            <div className="space-y-4">
                <select className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-purple-500/50 transition">
                    <option>1080p Full HD (Recommended)</option>
                    <option>2160p 4K UHD</option>
                </select>
                <select className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-purple-500/50 transition">
                    <option>MP4 (H.264)</option>
                    <option>MOV (ProRes)</option>
                </select>
            </div>

            <button 
              onClick={triggerExport}
              disabled={status === 'exporting'}
              className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-2xl ${
                status === 'exporting' 
                ? 'bg-slate-800 text-slate-500 cursor-wait' 
                : status === 'complete'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-black hover:bg-slate-200 active:scale-95'
              }`}
            >
              {status === 'exporting' ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Packaging...
                </>
              ) : status === 'complete' ? (
                <>
                  <CheckCircle size={20} />
                  Download Ready
                </>
              ) : (
                <>
                  <Download size={20} />
                  Download Assets
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}