'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function IdeationPage() {
  const router = useRouter()
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(false)
  const [ideas, setIdeas] = useState<any[]>([])

  const generateIdeas = async () => {
    if (!topic) return
    setLoading(true)
    setIdeas([]) // Clear previous results
    try {
      const res = await fetch('/api/ideation', {
        method: 'POST',
        body: JSON.stringify({ topic, style: 'Viral' })
      })
      const data = await res.json()
      if (data.ideas) setIdeas(data.ideas)
    } catch (e) { alert("AI Brain Freeze 🥶") }
    setLoading(false)
  }

  const convertToProject = async (idea: any) => {
    try {
        // 1. Create the project
        const { data, error } = await supabase.from('projects').insert({
            title: idea.title,
            // We initialize with the hook as the first scene
            content: JSON.stringify([{ audio: idea.hook, visual: "Intro Hook", type: "Stock Video" }]), 
            status: 'draft'
        }).select().single()

        if (error) throw error

        // 2. Redirect on success
        if (data) router.push(`/dashboard/project/${data.id}`)
        
    } catch (err: any) {
        alert("Error creating project: " + err.message)
        console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8 font-sans">
      
      {/* Navigation Link Back to Dashboard */}
      <button onClick={() => router.push('/dashboard')} className="mb-8 text-gray-400 hover:text-white">← Back to Dashboard</button>

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header input */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Viral Idea Generator
          </h1>
          <div className="flex max-w-xl mx-auto gap-2">
            <input 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a topic (e.g. Ancient Rome, Bitcoin)..."
              className="flex-1 bg-gray-900 border border-gray-700 p-4 rounded-lg text-lg focus:border-purple-500 outline-none"
              onKeyDown={(e) => e.key === 'Enter' && generateIdeas()}
            />
            <button 
                onClick={generateIdeas}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-500 px-8 py-4 rounded-lg font-bold text-lg transition-all"
            >
                {loading ? 'Thinking...' : 'Brainstorm 🧠'}
            </button>
          </div>
        </div>

        {/* Results Area */}
        {ideas.length > 0 && (
            <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                    <h3 className="text-gray-400 uppercase text-sm font-bold tracking-wider">Generated Concepts</h3>
                    <button onClick={generateIdeas} className="text-purple-400 hover:text-white text-sm font-bold flex items-center gap-1">
                        🔄 Reroll Ideas
                    </button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ideas.map((idea, i) => (
                    <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-purple-500 transition-all hover:shadow-2xl hover:shadow-purple-900/20 group flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${idea.score > 80 ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
                            Viral Score: {idea.score}
                        </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 leading-tight">{idea.title}</h3>
                    <p className="text-gray-400 text-sm mb-6 flex-1">{idea.hook}</p>
                    
                    <button 
                        onClick={() => convertToProject(idea)}
                        className="w-full py-3 bg-gray-800 group-hover:bg-purple-600 rounded-lg font-bold transition-colors shadow-lg"
                    >
                        🚀 Create Project
                    </button>
                    </div>
                ))}
                </div>
            </div>
        )}
      </div>
    </div>
  )
}