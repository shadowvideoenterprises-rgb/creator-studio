'use client'
import { useState, useEffect, useRef } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize2, Loader2 } from 'lucide-react'

interface PlayerProps {
  scenes: any[]
}

export function Player({ scenes }: PlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0)
  const [progress, setProgress] = useState(0) // 0 to 100 for current scene
  const [isLoading, setIsLoading] = useState(false)
  
  // Refs for Audio management
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const currentScene = scenes[currentSceneIndex]
  const hasAudio = currentScene?.scene_assets?.some((a: any) => a.asset_type === 'audio') || currentScene?.audio_url

  // Helper to get audio URL safely
  const getAudioUrl = (scene: any) => {
      // Check 'scene_assets' array or direct 'audio_url' property depending on your DB structure
      const asset = scene.scene_assets?.find((a: any) => a.asset_type === 'audio')
      return asset?.asset_url || scene.audio_url || null
  }

  const handlePlay = () => {
    if (!currentScene) return
    
    if (audioRef.current) {
        audioRef.current.play()
        setIsPlaying(true)
    } else {
        // Start from scratch
        playScene(currentSceneIndex)
    }
  }

  const handlePause = () => {
    if (audioRef.current) {
        audioRef.current.pause()
        setIsPlaying(false)
    }
  }

  const playScene = (index: number) => {
    if (index >= scenes.length) {
        setIsPlaying(false)
        setCurrentSceneIndex(0)
        setProgress(0)
        return // End of video
    }

    setCurrentSceneIndex(index)
    const scene = scenes[index]
    const url = getAudioUrl(scene)

    if (url) {
        setIsLoading(true)
        if (audioRef.current) {
            audioRef.current.src = url
            audioRef.current.load()
            audioRef.current.play()
                .then(() => {
                    setIsLoading(false)
                    setIsPlaying(true)
                })
                .catch(e => {
                    console.error("Playback error", e)
                    setIsLoading(false)
                    // Skip to next if error
                    setTimeout(() => playScene(index + 1), 1000)
                })
        }
    } else {
        // No audio, just show image for 3 seconds then next
        setIsPlaying(true)
        // Simulate progress
        let p = 0
        const interval = setInterval(() => {
            p += 10
            setProgress(p)
            if (p >= 100) {
                clearInterval(interval)
                playScene(index + 1)
            }
        }, 300)
        // Store interval to clear if paused (simplified for demo)
    }
  }

  // Handle Audio Events
  useEffect(() => {
      if (!audioRef.current) {
          audioRef.current = new Audio()
      }

      const audio = audioRef.current

      const onTimeUpdate = () => {
          if (audio.duration) {
              setProgress((audio.currentTime / audio.duration) * 100)
          }
      }

      const onEnded = () => {
          // Play next scene
          playScene(currentSceneIndex + 1)
      }

      audio.addEventListener('timeupdate', onTimeUpdate)
      audio.addEventListener('ended', onEnded)

      return () => {
          audio.removeEventListener('timeupdate', onTimeUpdate)
          audio.removeEventListener('ended', onEnded)
          audio.pause()
      }
  }, [currentSceneIndex, scenes]) // Re-bind when index changes is risky, better to use refs for index, but this is React-y way

  // Skip Controls
  const skip = (direction: number) => {
      const newIndex = Math.max(0, Math.min(scenes.length - 1, currentSceneIndex + direction))
      playScene(newIndex)
  }

  if (!scenes || scenes.length === 0) return <div className="h-64 bg-black rounded-2xl flex items-center justify-center text-slate-600">No scenes to play</div>

  return (
    <div className="w-full max-w-4xl mx-auto bg-black border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Screen Area */}
        <div className="relative aspect-video bg-[#121214] flex items-center justify-center group">
            {currentScene?.image_url ? (
                <img src={currentScene.image_url} className="w-full h-full object-contain" />
            ) : (
                <div className="text-slate-600 font-bold">No Visual Asset</div>
            )}

            {/* Overlay Controls */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
                 <button onClick={() => skip(-1)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 text-white"><SkipBack size={24}/></button>
                 
                 <button onClick={isPlaying ? handlePause : handlePlay} className="p-5 bg-white text-black rounded-full hover:scale-105 transition-transform flex items-center justify-center">
                    {isLoading ? <Loader2 className="animate-spin" size={32}/> : isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1"/>}
                 </button>

                 <button onClick={() => skip(1)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 text-white"><SkipForward size={24}/></button>
            </div>
            
            {/* Scene Label */}
            <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 rounded-full text-xs font-bold text-white backdrop-blur-sm">
                Scene {currentSceneIndex + 1} / {scenes.length}
            </div>
        </div>

        {/* Controls Bar */}
        <div className="h-14 bg-[#0a0a0a] border-t border-white/5 flex items-center px-4 gap-4">
            <span className="text-xs font-mono text-slate-400 w-12 text-right">
                {currentSceneIndex + 1}:{scenes.length}
            </span>
            
            {/* Progress Bar (Visual Only for now) */}
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-indigo-500 transition-all duration-200" 
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="flex items-center gap-3 text-slate-400">
                <Volume2 size={16} />
                <Maximize2 size={16} className="hover:text-white cursor-pointer" />
            </div>
        </div>

    </div>
  )
}
