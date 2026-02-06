'use client'
import { useState } from 'react'
import { X, Copy, Check, Hash, Type, FileText, Sparkles } from 'lucide-react'

interface MarketingModalProps {
  isOpen: boolean
  onClose: () => void
  data: any
  onGenerate: () => void
  isGenerating: boolean
}

export default function MarketingModal({ isOpen, onClose, data, onGenerate, isGenerating }: MarketingModalProps) {
  const [copied, setCopied] = useState<string | null>(null)

  if (!isOpen) return null

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#121214] w-full max-w-2xl rounded-3xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-pink-500/10 rounded-lg">
               <Sparkles size={20} className="text-pink-500" />
             </div>
             <h2 className="text-xl font-bold text-white">Viral Metadata Generator</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition"><X size={20} /></button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">
          
          {!data ? (
            <div className="text-center py-12 space-y-4">
               <p className="text-slate-400">Generate optimized titles, descriptions, and tags for your video.</p>
               <button 
                 onClick={onGenerate} 
                 disabled={isGenerating}
                 className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-pink-400 transition-all disabled:opacity-50"
               >
                 {isGenerating ? 'Analyzing Content...' : 'Generate Metadata'}
               </button>
            </div>
          ) : (
            <>
              {/* Titles Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-pink-400 text-xs font-bold uppercase tracking-widest">
                  <Type size={14} /> Viral Titles
                </div>
                <div className="grid gap-2">
                  {data.titles.map((title: string, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:border-pink-500/50 transition group">
                       <span className="font-medium text-slate-200">{title}</span>
                       <button onClick={() => copyToClipboard(title, `title-${i}`)} className="text-slate-500 hover:text-white transition">
                         {copied === `title-${i}` ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                       </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-widest">
                  <FileText size={14} /> SEO Description
                </div>
                <div className="relative group">
                   <textarea 
                     readOnly 
                     value={data.description} 
                     className="w-full h-32 bg-black/30 border border-white/10 rounded-xl p-4 text-slate-300 text-sm leading-relaxed resize-none focus:outline-none"
                   />
                   <button 
                     onClick={() => copyToClipboard(data.description, 'desc')}
                     className="absolute top-4 right-4 p-2 bg-black/50 rounded-lg hover:bg-white text-slate-400 hover:text-black transition"
                   >
                     {copied === 'desc' ? <Check size={16} /> : <Copy size={16} />}
                   </button>
                </div>
              </div>

              {/* Tags Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-widest">
                  <Hash size={14} /> Smart Tags
                </div>
                <div className="flex flex-wrap gap-2 p-4 bg-black/30 rounded-xl border border-white/10">
                   {data.tags.map((tag: string, i: number) => (
                     <span key={i} className="px-2 py-1 bg-purple-500/10 text-purple-300 text-xs rounded border border-purple-500/20">
                       {tag}
                     </span>
                   ))}
                   <button 
                     onClick={() => copyToClipboard(data.tags.join(' '), 'tags')}
                     className="ml-auto text-xs text-slate-500 hover:text-white flex items-center gap-1"
                   >
                     <Copy size={12} /> Copy All
                   </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}