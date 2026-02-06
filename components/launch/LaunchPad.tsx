'use client'
import { useState } from 'react'
import { Sparkles, Copy, Check, Youtube } from 'lucide-react'

export default function LaunchPad({ projectId }: { projectId: string }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const generateSEO = async () => {
    setLoading(true)
    const res = await fetch('/api/marketing', {
      method: 'POST',
      body: JSON.stringify({ projectId })
    })
    const json = await res.json()
    setData(json)
    setLoading(false)
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-[2rem] p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/20 rounded-lg text-red-500">
            <Youtube size={20} />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Launch Pad</h2>
        </div>
        <button 
          onClick={generateSEO}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all disabled:opacity-50"
        >
          {loading ? 'Optimizing...' : <><Sparkles size={16} /> Generate SEO</>}
        </button>
      </div>

      {data ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Top Title Suggestions</label>
            <div className="space-y-2">
              {data.titles.map((t: string, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded-xl group">
                  <span className="text-sm text-slate-200">{t}</span>
                  <button onClick={() => copyToClipboard(t, `title-${i}`)} className="text-slate-500 hover:text-white transition">
                    {copied === `title-${i}` ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Description</label>
            <div className="relative">
              <textarea 
                readOnly 
                value={data.description} 
                className="w-full h-40 bg-black/40 border border-white/5 rounded-2xl p-4 text-xs leading-relaxed text-slate-400 outline-none"
              />
              <button 
                onClick={() => copyToClipboard(data.description, 'desc')}
                className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-lg transition"
              >
                {copied === 'desc' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
          <p className="text-slate-600 text-sm italic">Click generate to create your marketing metadata.</p>
        </div>
      )}
    </div>
  )
}