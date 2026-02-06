'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function ProjectWorkspace() {
  const router = useRouter()
  const params = useParams()
  
  const [project, setProject] = useState<any>(null)
  const [content, setContent] = useState('')
  const [files, setFiles] = useState<any[]>([])
  
  const [saving, setSaving] = useState(false)
  const [generatingScript, setGeneratingScript] = useState(false)
  const [generatingVisuals, setGeneratingVisuals] = useState(false) // New State
  const [uploading, setUploading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function getData() {
      const { id } = params 
      const { data: proj } = await supabase.from('projects').select('*').eq('id', id).single()
      if (proj) {
        setProject(proj)
        setContent(proj.content || '')
        fetchFiles(proj.id)
      }
    }
    getData()
  }, [params])

  const fetchFiles = async (projectId: string) => {
    const { data } = await supabase.storage.from('project-files').list(projectId + '/')
    if (data) setFiles(data)
  }

  const saveWork = async () => {
    setSaving(true)
    await supabase.from('projects').update({ content }).eq('id', project.id)
    setSaving(false)
  }

  // --- AI FUNCTION 1: WRITE SCRIPT ---
  const generateScript = async () => {
    if (!project?.title) return
    setGeneratingScript(true)
    try {
      const prompt = `Write a engaging YouTube video script about: "${project.title}". 
      Structure:
      1. Hook (0-10s)
      2. Intro
      3. Body Paragraphs (Historical Facts)
      4. Conclusion
      Tone: Storytelling, exciting.`
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })
      const data = await response.json()
      if (data.text) setContent(content + "\n\n" + data.text)
    } catch (err) { console.error(err) }
    setGeneratingScript(false)
  }

  // --- AI FUNCTION 2: VISUAL PROMPTS (NEW) ---
  const generateVisuals = async () => {
    if (!content) {
      alert("Please write or generate a script first!")
      return
    }
    setGeneratingVisuals(true)
    try {
      const prompt = `Read this video script and generate 10 highly detailed, cinematic AI image prompts that illustrate the key scenes. 
      
      Script: 
      "${content.substring(0, 3000)}" 
      
      Format each prompt like this: 
      [SCENE 1]: (Description of visual, lighting, camera angle, 8k resolution)`
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })
      const data = await response.json()
      if (data.text) setContent(content + "\n\n--- 🎨 VISUAL PROMPTS ---\n" + data.text)
    } catch (err) { console.error(err) }
    setGeneratingVisuals(false)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return
    setUploading(true)
    const file = e.target.files[0]
    await supabase.storage.from('project-files').upload(`${project.id}/${file.name}`, file)
    await fetchFiles(project.id)
    setUploading(false)
  }

  if (!project) return <div className="text-white p-10">Loading...</div>

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col overflow-hidden">
      
      {/* Top Bar */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-white">← Back</button>
          <h1 className="text-xl font-bold">{project.title}</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {/* SCRIPT BUTTON */}
          <button 
            onClick={generateScript}
            disabled={generatingScript || generatingVisuals}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-bold transition flex items-center gap-2 text-sm"
          >
            {generatingScript ? 'Writing...' : '✨ Script'}
          </button>

          {/* VISUALS BUTTON (NEW) */}
          <button 
            onClick={generateVisuals}
            disabled={generatingScript || generatingVisuals}
            className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded font-bold transition flex items-center gap-2 text-sm"
          >
            {generatingVisuals ? 'Dreaming...' : '🎨 Visuals'}
          </button>

          <div className="h-6 w-px bg-gray-600 mx-2"></div>

          <button 
            onClick={saveWork}
            className={`${saving ? 'bg-green-600' : 'bg-purple-600 hover:bg-purple-700'} px-6 py-2 rounded font-bold transition`}
          >
            {saving ? 'Saved!' : 'Save'}
          </button>
          
          <div className="relative">
            <button onClick={() => setShowSettings(!showSettings)} className="p-2 bg-gray-700 rounded">⚙️</button>
            {showSettings && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded shadow-xl z-50">
                <button className="block w-full text-left px-4 py-2 hover:bg-gray-700 text-sm">✏️ Rename</button>
                <button className="block w-full text-left px-4 py-2 hover:bg-red-900 text-red-400 text-sm">🗑️ Delete</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 p-6 overflow-y-auto border-r border-gray-700">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your video script here..."
            className="w-full h-full bg-transparent text-lg text-white focus:outline-none font-mono leading-relaxed resize-none"
          />
        </div>
        <div className="w-80 bg-gray-800 p-4 flex flex-col overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-300">Assets</h3>
            <button onClick={() => fileInputRef.current?.click()} className="text-xs bg-gray-700 px-2 py-1 rounded">+ Upload</button>
            <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} />
          </div>
          <div className="space-y-3">
            {files.map((file) => (
              <div key={file.id} className="group relative bg-gray-900 rounded border border-gray-700 overflow-hidden">
                 <div className="aspect-video bg-gray-950 flex items-center justify-center">
                   <img 
                    src={`https://${process.env.NEXT_PUBLIC_SUPABASE_URL!.replace('https://', '')}/storage/v1/object/public/project-files/${project.id}/${file.name}`}
                    className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                   />
                </div>
                <div className="p-2 text-xs truncate text-gray-400">{file.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}