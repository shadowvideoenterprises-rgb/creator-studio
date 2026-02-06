'use client'
import { useState } from 'react'

export default function LaunchPad({ project, script, onClose }: any) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)

  const generatePackage = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script, title: project.title })
      })
      const json = await res.json()
      setData(json.data)
    } catch (e) { alert("Generation failed") }
    setLoading(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Copied to clipboard!")
  }

  // Export as a file for editing software
  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify({ project, script, marketing: data }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.title.replace(/\s+/g, '_')}_Package.json`
    a.click()
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-gray-900 w-full max-w-4xl h-[85vh] rounded-2xl border border-gray-700 flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
          <div>
              <h2 className="text-2xl font-bold text-white">🚀 Launch Control</h2>
              <p className="text-gray-400 text-sm">Prepare your video for liftoff</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">✕</button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
            {!data ? (
                <div className="h-full flex flex-col items-center justify-center space-y-6">
                    <div className="text-center space-y-2">
                        <p className="text-xl text-white font-medium">Ready to generate metadata?</p>
                        <p className="text-gray-400 text-sm max-w-md mx-auto">We will analyze your script to create SEO-optimized titles, tags, and descriptions.</p>
                    </div>
                    <button 
                        onClick={generatePackage} 
                        disabled={loading}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg shadow-purple-900/20 transition-all flex items-center gap-2"
                    >
                        {loading ? (
                            <><span className="animate-spin">⚡</span> Analyzing Script...</>
                        ) : (
                            <>✨ Generate Launch Package</>
                        )}
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        <div className="bg-gray-950 border border-gray-800 p-4 rounded-xl">
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Optimized Title</label>
                            <div className="flex gap-2">
                                <input readOnly value={data.optimizedTitle} className="bg-transparent w-full text-white font-bold outline-none"/>
                                <button onClick={() => copyToClipboard(data.optimizedTitle)} className="text-blue-400 text-xs hover:text-white">COPY</button>
                            </div>
                        </div>

                        <div className="bg-gray-950 border border-gray-800 p-4 rounded-xl">
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Description</label>
                            <textarea readOnly value={data.description} className="bg-transparent w-full h-40 text-gray-300 text-sm outline-none resize-none"/>
                            <div className="text-right mt-2">
                                <button onClick={() => copyToClipboard(data.description)} className="text-blue-400 text-xs hover:text-white font-bold">COPY DESCRIPTION</button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        <div className="bg-gray-950 border border-gray-800 p-4 rounded-xl">
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Tags</label>
                            <div className="flex flex-wrap gap-2">
                                {data.tags.map((tag: string, i: number) => (
                                    <span key={i} className="bg-gray-800 px-2 py-1 rounded text-xs text-gray-300">#{tag}</span>
                                ))}
                            </div>
                            <div className="text-right mt-2">
                                <button onClick={() => copyToClipboard(data.tags.join(','))} className="text-blue-400 text-xs hover:text-white font-bold">COPY ALL</button>
                            </div>
                        </div>

                        <div className="bg-gray-950 border border-gray-800 p-4 rounded-xl">
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Pinned Comment</label>
                            <div className="flex gap-2 items-start">
                                <p className="text-sm text-gray-300 flex-1">{data.pinnedComment}</p>
                                <button onClick={() => copyToClipboard(data.pinnedComment)} className="text-blue-400 text-xs hover:text-white shrink-0">COPY</button>
                            </div>
                        </div>
                        
                        <button onClick={downloadJSON} className="w-full bg-green-600 hover:bg-green-500 py-3 rounded-lg font-bold text-white shadow-lg">
                            💾 Export Project File (JSON)
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  )
}