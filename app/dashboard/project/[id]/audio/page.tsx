'use client'
import { useState, useEffect, use, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Mic, Play, Pause, RefreshCw, Volume2, Wand2, Loader2 } from 'lucide-react'

export default function AudioPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const projectId = resolvedParams.id
  
  const [scenes, setScenes] = useState<any[]>([])
  // Track the currently playing scene ID
  const [playingId, setPlayingId] = useState<string | null>(null)
  // Track which scene is currently regenerating
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null)
  
  // Ref to hold the actual HTML Audio Element so we can pause it
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => { fetchScenes() }, [])

  // Cleanup audio when leaving page
  useEffect(() => {
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause()
      }
    }
  }, [])

  const fetchScenes = async () => {
    const { data } = await supabase
      .from('scenes')
      .select('*, scene_assets(*)')
      .eq('project_id', projectId)
      .order('sequence_order', { ascending: true })
    setScenes(data || [])
  }

  // --- FIXED PLAY/PAUSE LOGIC ---
  const togglePlay = (url: string, id: string) => {
    // 1. If clicking the SAME button that is playing -> PAUSE
    if (playingId === id) {
      audioPlayerRef.current?.pause()
      setPlayingId(null)
      return
    }

    // 2. If clicking a DIFFERENT button -> STOP previous, PLAY new
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause()
    }

    const newAudio = new Audio(url)
    newAudio.onended = () => setPlayingId(null)
    newAudio.play().catch(e => console.error("Playback failed", e))
    
    audioPlayerRef.current = newAudio
    setPlayingId(id)
  }

  // --- FIXED REGENERATE LOGIC ---
  const handleRegenerate = async (sceneId: string) => {
    setRegeneratingId(sceneId)
    
    try {
      // We reuse the batch API for simplicity in Beta
      // Ideally, we'd have a single-scene endpoint, but this works for Mock mode
      await fetch('/api/generate/audio', {
        method: 'POST',
        body: JSON.stringify({ 
           projectId, 
           userId: (await supabase.auth.getUser()).data.user?.id,
           model: 'mock-free' 
        })
      })
      
      // Refresh data to show new timestamp/file
      await fetchScenes()
    } catch (e) {
      console.error('Regen failed', e)
    } finally {
      setRegeneratingId(null)
    }
  }

  return (
    <div className="p-8 min-h-screen space-y-8">
      
      {/* Header */}
      <div className="flex justify-between items-end border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Mic className="text-emerald-500" />
            Audio Studio
          </h1>
          <p className="text-slate-500 mt-2">Review voiceovers, adjust pacing, and select voice actors.</p>
        </div>
        
        <div className="flex gap-3">
           <select className="bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-slate-300 focus:outline-none">
              <option>Voice: Adam (Deep)</option>
              <option>Voice: Rachel (Energetic)</option>
           </select>
           <button 
             onClick={() => handleRegenerate('all')} 
             className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-all flex items-center gap-2"
           >
             <Wand2 size={18} />
             <span>Generate All</span>
           </button>
        </div>
      </div>

      {/* Audio List */}
      <div className="space-y-4 max-w-4xl">
        {scenes.map((scene) => {
          const audioAsset = scene.scene_assets?.find((a: any) => a.asset_type === 'audio')
          const isRegenerating = regeneratingId === scene.id || regeneratingId === 'all'
          
          return (
            <div key={scene.id} className="bg-[#121214] border border-white/5 p-4 rounded-2xl flex items-center gap-6 group hover:border-emerald-500/30 transition-all">
              
              {/* Scene Number */}
              <div className="w-12 h-12 rounded-xl bg-white/5 flex flex-col items-center justify-center shrink-0">
                 <span className="text-[10px] font-bold text-slate-500 uppercase">Scene</span>
                 <span className="text-lg font-black text-white">{scene.sequence_order}</span>
              </div>

              {/* Script Text */}
              <div className="flex-1">
                 <p className="text-slate-300 text-lg font-medium leading-relaxed">"{scene.audio_text}"</p>
                 <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] uppercase font-bold text-slate-600 tracking-widest">Duration: ~6s</span>
                    {audioAsset && !isRegenerating && (
                        <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-widest flex items-center gap-1">
                            <Volume2 size={10} /> Ready
                        </span>
                    )}
                 </div>
              </div>

              {/* Player Controls */}
              <div className="shrink-0 flex items-center gap-3">
                 {audioAsset && !isRegenerating ? (
                   <button 
                     onClick={() => togglePlay(audioAsset.asset_url, scene.id)}
                     className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-emerald-900/20"
                   >
                     {playingId === scene.id ? <Pause fill="currentColor" /> : <Play fill="currentColor" className="ml-1" />}
                   </button>
                 ) : (
                   <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-slate-400">
                     {isRegenerating ? '...' : 'No Audio'}
                   </button>
                 )}
                 
                 <button 
                   onClick={() => handleRegenerate(scene.id)}
                   disabled={isRegenerating}
                   className={`p-3 text-slate-600 hover:text-white transition-colors ${isRegenerating ? 'animate-spin text-emerald-500' : ''}`} 
                   title="Regenerate"
                 >
                   {isRegenerating ? <Loader2 size={18} /> : <RefreshCw size={18} />}
                 </button>
              </div>

            </div>
          )
        })}
      </div>
    </div>
  )
}
