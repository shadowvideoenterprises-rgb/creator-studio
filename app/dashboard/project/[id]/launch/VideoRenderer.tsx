'use client'
import { useState, useRef } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import { Download, Loader2, Video } from 'lucide-react'
import { useToast } from '@/components/ToastProvider'

interface RendererProps {
  scenes: any[]
  projectTitle: string
}

export function VideoRenderer({ scenes, projectTitle }: RendererProps) {
  const { toast } = useToast()
  const [loaded, setLoaded] = useState(false)
  const [rendering, setRendering] = useState(false)
  const [progress, setProgress] = useState(0)
  const ffmpegRef = useRef(new FFmpeg())
  const messageRef = useRef<HTMLParagraphElement | null>(null)

  const loadFFmpeg = async () => {
    const ffmpeg = ffmpegRef.current
    ffmpeg.on('log', ({ message }) => {
        if (messageRef.current) messageRef.current.innerHTML = message
    })
    ffmpeg.on('progress', ({ progress }) => {
        setProgress(Math.round(progress * 100))
    })

    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
    await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    })
    setLoaded(true)
  }

  const renderVideo = async () => {
    setRendering(true)
    const ffmpeg = ffmpegRef.current
    if (!loaded) await loadFFmpeg()

    try {
        const fileList = []

        // 1. Load Assets into Virtual File System
        for (let i = 0; i < scenes.length; i++) {
            const scene = scenes[i]
            const imgName = `image${i}.png`
            const audioName = `audio${i}.mp3`
            
            // Write Image
            if (scene.image_url) {
                await ffmpeg.writeFile(imgName, await fetchFile(scene.image_url))
            } else {
                // Create black placeholder if missing (omitted for brevity)
                continue 
            }

            // Write Audio
            const audioUrl = scene.scene_assets?.find((a: any) => a.asset_type === 'audio')?.asset_url || scene.audio_url
            if (audioUrl) {
                await ffmpeg.writeFile(audioName, await fetchFile(audioUrl))
                fileList.push({ img: imgName, audio: audioName, duration: scene.estimated_duration })
            }
        }

        // 2. Create File List for FFmpeg Concat
        // Complex Filter: Loop image for duration of audio, then concat
        let filterComplex = ''
        let inputs = ''
        
        // This is a simplified concatenation strategy. 
        // Real-world requires complex filter chains to match timestamps perfectly.
        // For MVP, we will render scene-by-scene then concat.
        
        const outputList = []

        for (let i = 0; i < fileList.length; i++) {
            const { img, audio } = fileList[i]
            const outName = `part${i}.mp4`
            
            // Command: Take image + audio, output mp4 video
            // -loop 1: Loop image
            // -i image: Input image
            // -i audio: Input audio
            // -shortest: Stop when audio ends
            // -c:v libx264: Video Codec
            // -pix_fmt yuv420p: Format for compatibility
            await ffmpeg.exec([
                '-loop', '1', '-i', img, '-i', audio, 
                '-c:v', 'libx264', '-t', '10', '-pix_fmt', 'yuv420p', '-shortest', 
                outName
            ])
            outputList.push(`file '${outName}'`)
        }

        // Concat List
        await ffmpeg.writeFile('concat_list.txt', outputList.join('\n'))
        
        // Final Merge
        await ffmpeg.exec(['-f', 'concat', '-safe', '0', '-i', 'concat_list.txt', '-c', 'copy', 'output.mp4'])

        // 3. Read Result
        const data = await ffmpeg.readFile('output.mp4')
        
        // 4. Download
        const url = URL.createObjectURL(new Blob([(data as any).buffer], { type: 'video/mp4' }))
        const a = document.createElement('a')
        a.href = url
        a.download = `${projectTitle.replace(/\s+/g, '_')}.mp4`
        a.click()
        
        toast("Render Complete!", "success")

    } catch (e) {
        console.error(e)
        toast("Render Failed", "error")
    }
    setRendering(false)
    setProgress(0)
  }

  return (
    <div className="bg-[#121214] border border-white/5 rounded-2xl p-6 mt-8">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Video size={18} /> Export Video</h3>
        <p className="text-slate-400 text-sm mb-6">Render a final MP4 file directly in your browser. (Experimental)</p>
        
        {rendering ? (
            <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-400">
                    <span>Rendering...</span>
                    <span>{progress}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
                <p ref={messageRef} className="text-[10px] text-slate-600 font-mono truncate"></p>
            </div>
        ) : (
            <button 
                onClick={renderVideo}
                className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
            >
                <Download size={18} /> Render MP4
            </button>
        )}
    </div>
  )
}
