'use client'
import { useState, useEffect, useRef } from 'react'

export default function ProjectPlayer({ scenes, onClose }: any) {
  const [index, setIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  
  const audioRef = useRef<HTMLAudioElement>(null)
  const timerRef = useRef<any>(null)

  const currentScene = scenes[index]
  const hasAudio = !!currentScene.audioUrl

  // Handle Play/Pause & Scene Changes
  useEffect(() => {
    if (!isPlaying) {
        audioRef.current?.pause()
        clearTimeout(timerRef.current)
        return
    }

    if (hasAudio) {
        // Play Audio
        audioRef.current?.play().catch(e => console.log("Audio play failed", e))
    } else {
        // No Audio? Show for 4 seconds then advance
        timerRef.current = setTimeout(() => handleNext(), 4000)
    }
  }, [index, isPlaying, hasAudio])

  const handleNext = () => {
    if (index < scenes.length - 1) {
        setIndex(prev => prev + 1)
        setProgress(0)
    } else {
        setIsPlaying(false) // End of video
    }
  }

  const togglePlay = () => setIsPlaying(!isPlaying)

  return (
    <div className="fixed inset-0 bg-black/95 z-[60] flex flex-col items-center justify-center p-4 backdrop-blur-xl">
      
      {/* 1. Main Viewer (16:9 Aspect Ratio) */}
      <div className="relative w-full max-w-5xl aspect-video bg-black rounded-xl border border-gray-800 shadow-2xl overflow-hidden group">
        
        {/* Visual Layer */}
        {currentScene.assetUrl ? (
            currentScene.type?.includes('Video') ? (
                <video 
                    src={currentScene.assetUrl} 
                    className="w-full h-full object-cover" 
                    autoPlay={isPlaying} 
                    loop 
                    muted 
                    playsInline
                />
            ) : (
                <img 
                    src={currentScene.assetUrl} 
                    className="w-full h-full object-cover animate-in fade-in zoom-in duration-[10s]" 
                    alt="Scene visual" 
                />
            )
        ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-700 space-y-4">
                <span className="text-6xl">🎬</span>
                <p className="font-mono text-sm uppercase tracking-widest">Missing Visual Asset</p>
            </div>
        )}

        {/* Audio Layer (Hidden) */}
        {hasAudio && (
            <audio 
                ref={audioRef} 
                src={currentScene.audioUrl} 
                onEnded={handleNext}
                onTimeUpdate={(e) => {
                    const el = e.currentTarget
                    setProgress((el.currentTime / el.duration) * 100)
                }}
            />
        )}

        {/* Subtitles Layer */}
        <div className="absolute bottom-12 left-0 right-0 text-center px-10">
            <span className="bg-black/60 text-white px-4 py-2 rounded-lg text-lg font-medium shadow-lg backdrop-blur-sm">
                {currentScene.audio || "..."}
            </span>
        </div>

        {/* Controls Overlay (Visible on Hover) */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-8">
            <button 
                onClick={() => setIndex(Math.max(0, index - 1))}
                className="text-white hover:text-purple-400 transition-colors text-4xl"
            >
                ⏮
            </button>
            <button 
                onClick={togglePlay}
                className="bg-white text-black rounded-full w-20 h-20 flex items-center justify-center text-4xl hover:scale-105 transition-transform shadow-xl"
            >
                {isPlaying ? '⏸' : '▶'}
            </button>
            <button 
                onClick={handleNext}
                className="text-white hover:text-purple-400 transition-colors text-4xl"
            >
                ⏭
            </button>
        </div>

        {/* Progress Bar (Bottom) */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-800">
            <div 
                className="h-full bg-purple-600 transition-all duration-200 ease-linear"
                style={{ width: `${progress}%` }}
            />
        </div>
      </div>

      {/* 2. Timeline Strip */}
      <div className="w-full max-w-5xl mt-6 flex gap-2 overflow-x-auto pb-4 px-2">
        {scenes.map((s: any, i: number) => (
            <div 
                key={i} 
                onClick={() => { setIndex(i); setIsPlaying(true); }}
                className={`w-24 h-16 shrink-0 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${index === i ? 'border-purple-500 scale-105 shadow-purple-500/50 shadow-lg' : 'border-gray-800 opacity-50 hover:opacity-100'}`}
            >
                {s.assetUrl ? (
                    <img src={s.assetUrl} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gray-900" />
                )}
            </div>
        ))}
      </div>

      {/* Close Button */}
      <button 
        onClick={onClose} 
        className="absolute top-6 right-6 text-white/50 hover:text-white text-4xl"
      >
        ✕
      </button>

    </div>
  )
}