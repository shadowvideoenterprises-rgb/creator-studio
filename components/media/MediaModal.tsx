'use client'
import { useState } from 'react'
import { MediaService } from '@/lib/services/media.service'
import { Search, X, ImageIcon, Check } from 'lucide-react'

export default function MediaModal({ sceneId, onClose, onSelect }: any) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)
    const media = await MediaService.searchPexels(query)
    setResults(media)
    setIsSearching(false)
  }

  const selectAsset = async (asset: any) => {
    const success = await MediaService.attachAssetToScene(sceneId, asset.url, asset.source)
    if (success) {
      onSelect(sceneId, asset.url)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0f0f12] border border-white/10 w-full max-w-4xl max-h-[80vh] rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
              <ImageIcon size={20} />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Media Library</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="p-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search high-quality stock photos (e.g. 'cyberpunk city', 'peaceful nature')..."
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-blue-500/50 outline-none transition shadow-inner"
            />
          </div>
        </form>

        {/* Results Grid */}
        <div className="flex-1 overflow-y-auto p-6 pt-0">
          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-mono text-slate-500 uppercase tracking-widest">Scanning Pexels...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {results.map((img) => (
                <button 
                  key={img.id}
                  onClick={() => selectAsset(img)}
                  className="group relative aspect-video rounded-xl overflow-hidden border border-white/5 hover:border-blue-500/50 transition-all"
                >
                  <img src={img.url} alt="Stock result" className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Check className="text-white" size={32} />
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {results.length === 0 && !isSearching && (
            <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
              <p className="text-slate-600 text-sm">Enter a search term to find visuals for your scene.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}