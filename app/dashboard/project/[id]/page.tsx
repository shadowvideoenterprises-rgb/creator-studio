'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import MediaSelector from '@/components/MediaSelector'
import LaunchPad from '@/components/LaunchPad'
import ProjectPlayer from '@/components/ProjectPlayer'

export default function ProjectWorkspace() {
  const router = useRouter()
  const params = useParams()
  
  const [project, setProject] = useState<any>(null)
  const [scenes, setScenes] = useState<any[]>([]) 
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)

  // Media Picker State
  const [showPicker, setShowPicker] = useState(false)
  const [activeSceneIndex, setActiveSceneIndex] = useState<number | null>(null)

  // Launch Pad State
  const [showLaunchPad, setShowLaunchPad] = useState(false)
  
  // Audio State
  const [audioLoading, setAudioLoading] = useState<number | null>(null)

  // Player State (NEW)
  const [showPlayer, setShowPlayer] = useState(false)

  useEffect(() => {
    async function getData() {
      const id = Array.isArray(params.id) ? params.id[0] : params.id
      if (!id) return

      const { data: proj } = await supabase.from('projects').select('*').eq('id', id).single()
      if (proj) {
        setProject(proj)
        try {
            const parsed = JSON.parse(proj.content)
            if (Array.isArray(parsed) && parsed.length > 0) setScenes(parsed)
            else setScenes([{ audio: "", visual: "", type: "Stock Video" }])
        } catch {
            setScenes(proj.content ? [{ audio: proj.content, visual: "Legacy content", type: "Stock Video" }] : [])
        }
      }
    }
    getData()
  }, [params])

  const saveWork = async () => {
    setSaving(true)
    await supabase.from('projects').update({ content: JSON.stringify(scenes) }).eq('id', project.id)
    setSaving(false)
  }

  const generateScript = async () => {
    if (!project?.title) return
    setGenerating(true)
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: project.title, type: 'script', pacing: 'Cinematic' })
      })
      const data = await response.json()
      if (data.data) {
          setScenes(data.data)
          await supabase.from('projects').update({ content: JSON.stringify(data.data) }).eq('id', project.id)
      } else alert("AI response format error")
    } catch (err) { alert("AI Generation failed.") }
    setGenerating(false)
  }

  // --- AUDIO GENERATION ---
  const generateVoiceover = async (index: number) => {
    const text = scenes[index].audio
    if (!text) return alert("Write some audio text first!")
    
    setAudioLoading(index)
    try {
        // 1. Generate MP3
        const res = await fetch('/api/generate/audio', {
            method: 'POST',
            body: JSON.stringify({ text })
        })
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        
        // 2. Upload to Supabase (Convert Base64 to Blob)
        const base64Data = data.audio.split(',')[1]
        const byteCharacters = atob(base64Data)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i)
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: 'audio/mpeg' })

        const fileName = `voice-${Date.now()}.mp3`
        const { error: uploadError } = await supabase.storage.from('assets').upload(fileName, blob)
        if (uploadError) throw uploadError

        const { data: publicData } = supabase.storage.from('assets').getPublicUrl(fileName)
        
        // 3. Save to Scene
        updateScene(index, 'audioUrl', publicData.publicUrl)

    } catch (e: any) { alert("Audio Failed: " + e.message) }
    setAudioLoading(null)
  }

  const updateScene = (index: number, field: string, value: string) => {
    const newScenes = [...scenes]
    newScenes[index][field] = value
    setScenes(newScenes)
  }

  // --- Media Picker Handlers ---
  const openPicker = (index: number) => {
    setActiveSceneIndex(index)
    setShowPicker(true)
  }

  const handleMediaSelect = (url: string) => {
    if (activeSceneIndex !== null) {
        updateScene(activeSceneIndex, 'assetUrl', url)
        updateScene(activeSceneIndex, 'type', 'Stock Photo') 
        setShowPicker(false)
        setActiveSceneIndex(null)
    }
  }

  if (!project) return <div className="text-white p-10 flex justify-center">Loading Studio...</div>

  return (
    <div className="h-screen bg-gray-950 text-white flex flex-col overflow-hidden font-sans">
      
      {/* Top Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-4 flex justify-between items-center shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white transition-colors">← Back</button>
          <h1 className="text-lg font-bold truncate max-w-md">{project.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={generateScript} disabled={generating} className={`px-4 py-2 rounded text-sm font-bold transition-all ${generating ? 'bg-gray-700 text-gray-400' : 'bg-blue-600 hover:bg-blue-500 shadow-lg'}`}>
            {generating ? '✨ Writing...' : '✨ AI Write'}
          </button>
          <button onClick={saveWork} className={`px-6 py-2 rounded text-sm font-bold transition-all ${saving ? 'bg-green-600' : 'bg-purple-600 hover:bg-purple-500 shadow-lg'}`}>
            {saving ? 'Saved!' : 'Save Work'}
          </button>
          <button onClick={() => setShowLaunchPad(true)} className="bg-green-600 hover:bg-green-500 px-6 py-2 rounded text-sm font-bold shadow-lg transition-all">
            🚀 Launch
          </button>
          {/* NEW: Watch Button */}
          <button onClick={() => setShowPlayer(true)} className="bg-pink-600 hover:bg-pink-500 px-6 py-2 rounded text-sm font-bold shadow-lg transition-all flex items-center gap-2">
            ▶ Watch
          </button>
          <button onClick={() => router.push(`/dashboard/project/${project.id}/export`)} className="bg-teal-600 hover:bg-teal-500 px-6 py-2 rounded text-sm font-bold shadow-lg transition-all">
            Export
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 p-8 overflow-y-auto bg-black/50">
          <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {scenes.map((scene, index) => (
              <div key={index} className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4 relative group hover:border-gray-700 transition-colors">
                
                {/* Scene Header */}
                <div className="flex justify-between items-center border-b border-gray-800 pb-2 mb-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Scene {index + 1}</span>
                    <button onClick={() => {
                        const newScenes = scenes.filter((_, i) => i !== index);
                        setScenes(newScenes);
                    }} className="text-gray-600 hover:text-red-400 px-2">🗑️</button>
                </div>

                <div className="flex gap-6">
                    {/* Left: Script & Visual Text */}
                    <div className="flex-1 space-y-4">
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-xs font-bold text-blue-400 uppercase tracking-wide">🎙️ Audio / Voiceover</label>
                                <button 
                                    onClick={() => generateVoiceover(index)}
                                    disabled={audioLoading === index}
                                    className="text-[10px] bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-1"
                                >
                                    {audioLoading === index ? 'Generating...' : '🎤 Generate Audio'}
                                </button>
                            </div>
                            <textarea 
                                value={scene.audio || ''} 
                                onChange={(e) => updateScene(index, 'audio', e.target.value)} 
                                className="w-full bg-gray-950/50 border border-gray-800 p-4 rounded-lg text-base focus:outline-none focus:border-blue-500/50 min-h-[80px] transition-all"
                                placeholder="Enter narration text here..."
                            />
                            {/* Audio Player */}
                            {scene.audioUrl && (
                                <div className="mt-2 bg-gray-950 border border-gray-800 rounded p-2 flex items-center gap-2">
                                    <span className="text-xs text-gray-500">🔊 Preview:</span>
                                    <audio controls src={scene.audioUrl} className="h-6 w-full max-w-[200px]" />
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-purple-400 mb-1.5 uppercase tracking-wide">👁️ Visual Description</label>
                            <input 
                                value={scene.visual || ''} 
                                onChange={(e) => updateScene(index, 'visual', e.target.value)} 
                                className="w-full bg-gray-950/50 border border-gray-800 p-3 rounded-lg text-sm focus:outline-none focus:border-purple-500/50 transition-all"
                                placeholder="Describe the scene..."
                            />
                        </div>
                    </div>

                    {/* Right: Asset Preview */}
                    <div className="w-64 shrink-0 flex flex-col gap-2">
                         <label className="block text-xs font-bold text-orange-400 mb-0.5 uppercase tracking-wide">📦 Asset</label>
                         
                         <div 
                            className="aspect-video bg-black rounded-lg border border-gray-800 overflow-hidden relative group/thumb cursor-pointer"
                            onClick={() => openPicker(index)}
                         >
                            {scene.assetUrl ? (
                                <img src={scene.assetUrl} className="w-full h-full object-cover" alt="Scene Asset" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 gap-2">
                                    <span className="text-2xl">🖼️</span>
                                    <span className="text-xs font-medium">Select Media</span>
                                </div>
                            )}

                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-all">
                                <span className="bg-white text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-lg transform hover:scale-105 transition-transform">
                                    🔍 Search Stock
                                </span>
                            </div>
                         </div>

                         <select 
                            value={scene.type || 'Stock Video'} 
                            onChange={(e) => updateScene(index, 'type', e.target.value)} 
                            className="w-full bg-gray-800 border-none p-2 rounded text-xs text-gray-300 focus:ring-1 focus:ring-gray-600"
                         >
                            <option>Stock Video</option><option>Stock Photo</option><option>AI Image</option>
                         </select>
                    </div>
                </div>
              </div>
            ))}
            
            <button 
                onClick={() => setScenes([...scenes, { audio: "", visual: "", type: "Stock Video" }])}
                className="w-full py-4 border-2 border-dashed border-gray-800 rounded-xl text-gray-500 hover:text-white hover:border-gray-600 hover:bg-gray-900 transition-all font-bold"
            >
                + Add New Scene
            </button>
          </div>
        </div>
      </div>

      {showPicker && activeSceneIndex !== null && (
        <MediaSelector query={scenes[activeSceneIndex]?.visual || ''} onSelect={handleMediaSelect} onClose={() => setShowPicker(false)} />
      )}
      
      {showLaunchPad && <LaunchPad project={project} script={scenes} onClose={() => setShowLaunchPad(false)} />}
      
      {/* NEW: Player Modal */}
      {showPlayer && <ProjectPlayer scenes={scenes} onClose={() => setShowPlayer(false)} />}
    </div>
  )
}