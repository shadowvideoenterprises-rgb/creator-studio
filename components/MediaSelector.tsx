'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface MediaSelectorProps {
  query: string
  onSelect: (url: string) => void
  onClose: () => void
}

export default function MediaSelector({ query, onSelect, onClose }: MediaSelectorProps) {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState(query)
  const [type, setType] = useState('photos') // 'photos', 'videos', 'ai'

  // AI State
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  // Auto-search only if we are in search mode
  useEffect(() => {
    if (type !== 'ai') handleSearch()
  }, [type])

  const handleSearch = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/assets/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchTerm, type })
      })
      const data = await res.json()
      setResults(data.results || [])
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const handleGenerateAI = async () => {
    setLoading(true)
    setGeneratedImage(null)
    try {
        const res = await fetch('/api/generate/image', {
            method: 'POST',
            body: JSON.stringify({ prompt: searchTerm })
        })
        const data = await res.json()
        if (data.url) setGeneratedImage(data.url)
        else alert("Generation failed: " + (data.error || "Unknown error"))
    } catch (e) { alert("AI Error") }
    setLoading(false)
  }

  // Save Gemini/AI image to Supabase so it doesn't expire
  const selectAIImage = async () => {
    if (!generatedImage) return
    setUploading(true)
    try {
        let blob;

        // CHECK: Is this a Base64 string (Gemini) or a URL?
        if (generatedImage.startsWith('data:')) {
            // Convert Base64 to Blob
            const base64Data = generatedImage.split(',')[1]
            const byteCharacters = atob(base64Data)
            const byteNumbers = new Array(byteCharacters.length)
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i)
            }
            const byteArray = new Uint8Array(byteNumbers)
            blob = new Blob([byteArray], { type: 'image/jpeg' })
        } else {
            // Fetch URL (Fallback)
            const res = await fetch(generatedImage)
            blob = await res.blob()
        }
        
        // Upload to Supabase Storage
        const fileName = `ai-gen-${Date.now()}.jpg`
        const { data, error } = await supabase.storage.from('assets').upload(fileName, blob)
        
        if (error) throw error

        // Get Public URL
        const { data: publicData } = supabase.storage.from('assets').getPublicUrl(fileName)
        
        // Select it
        onSelect(publicData.publicUrl)
        
    } catch (err: any) {
        alert("Upload failed: " + err.message)
        console.error(err)
    }
    setUploading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8 backdrop-blur-sm">
      <div className="bg-gray-900 w-full max-w-5xl h-[85vh] rounded-xl flex flex-col border border-gray-700 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex gap-4 bg-gray-800/50 shrink-0">
          <input 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-black/50 border border-gray-600 p-2.5 rounded text-white focus:outline-none focus:border-purple-500"
            placeholder={type === 'ai' ? "Describe the image you want..." : "Search for assets..."}
            onKeyDown={(e) => e.key === 'Enter' && (type === 'ai' ? handleGenerateAI() : handleSearch())}
          />
          <div className="flex bg-gray-700 rounded p-1 shrink-0">
             <button 
                onClick={() => setType('photos')}
                className={`px-4 py-1.5 rounded text-sm font-bold transition-all ${type === 'photos' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
             >Photos</button>
             <button 
                onClick={() => setType('videos')}
                className={`px-4 py-1.5 rounded text-sm font-bold transition-all ${type === 'videos' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
             >Videos</button>
             <button 
                onClick={() => setType('ai')}
                className={`px-4 py-1.5 rounded text-sm font-bold transition-all ${type === 'ai' ? 'bg-pink-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
             >✨ AI Gen</button>
          </div>
          
          <button 
            onClick={type === 'ai' ? handleGenerateAI : handleSearch} 
            className="bg-blue-600 hover:bg-blue-500 px-6 rounded text-white font-bold shrink-0 transition-colors"
          >
            {type === 'ai' ? 'Generate' : 'Search'}
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-white px-4 shrink-0 text-xl">✕</button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-950/50">
          {loading ? (
             <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <p>{type === 'ai' ? "Dreaming up your image..." : "Searching visual database..."}</p>
             </div>
          ) : type === 'ai' ? (
            // --- AI View ---
            <div className="h-full flex flex-col items-center justify-center">
                {!generatedImage ? (
                    <div className="text-center text-gray-500">
                        <span className="text-4xl block mb-2">🎨</span>
                        <p>Type a prompt and hit Generate</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                        <img src={generatedImage} className="rounded-lg shadow-2xl max-h-[50vh] border border-gray-700" />
                        <button 
                            onClick={selectAIImage}
                            disabled={uploading}
                            className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition-all"
                        >
                            {uploading ? 'Saving to Cloud...' : 'Use This Image'}
                        </button>
                        <p className="text-xs text-gray-500">Image will be saved to your project assets</p>
                    </div>
                )}
            </div>
          ) : (
            // --- Search View ---
            results.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500">No results found.</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {results.map((item) => (
                <div 
                    key={item.id} 
                    className="group relative cursor-pointer rounded-lg overflow-hidden aspect-video bg-gray-800 border border-transparent hover:border-purple-500 transition-all hover:shadow-purple-500/20 hover:shadow-lg"
                    onClick={() => onSelect(item.type === 'video' ? item.thumbnail : item.url)}
                >
                    <img src={item.thumbnail} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3 pt-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs text-white font-bold truncate">{item.provider}</p>
                    <p className="text-[10px] text-gray-300 truncate">by {item.author}</p>
                    </div>
                    {item.type === 'video' && (
                        <div className="absolute top-2 right-2 bg-black/60 rounded px-1.5 py-0.5 text-[10px] font-bold text-white flex items-center gap-1">
                            <span>🎥</span> Video
                        </div>
                    )}
                </div>
                ))}
                </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}