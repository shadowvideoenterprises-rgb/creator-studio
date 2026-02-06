'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [newProjectName, setNewProjectName] = useState('')
  const [loading, setLoading] = useState(true)

  // 1. Fetch User & Projects on Load
  useEffect(() => {
    async function getData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }
      setUser(user)

      // Fetch projects for this user
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (data) setProjects(data)
      setLoading(false)
    }
    getData()
  }, [router])

  // 2. Handle Creating a New Project
  const createProject = async () => {
    if (!newProjectName.trim()) return

    const { data, error } = await supabase
      .from('projects')
      .insert([
        { title: newProjectName, user_id: user.id }
      ])
      .select()

    if (error) {
      console.error('Error creating project:', error)
    } else {
      // Add the new project to the list instantly (no refresh needed)
      setProjects([data[0], ...projects])
      setNewProjectName('') // Clear the input
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return <div className="p-10 text-white bg-gray-900 min-h-screen">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-12 border-b border-gray-700 pb-4">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            🚀 Creator Dashboard
          </h1>
          <button onClick={handleSignOut} className="text-gray-400 hover:text-white transition">
            Sign Out
          </button>
        </div>

        {/* "Create New" Section */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-8">
          <h2 className="text-xl font-bold mb-4">Start a New Project</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Project Name (e.g., YouTube History Video)"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="flex-1 bg-gray-900 border border-gray-600 rounded p-3 text-white focus:outline-none focus:border-purple-500"
              onKeyDown={(e) => e.key === 'Enter' && createProject()}
            />
            <button 
              onClick={createProject}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded font-bold transition"
            >
              + Create
            </button>
          </div>
        </div>

        {/* Project List */}
        <div className="grid grid-cols-1 gap-4">
          <h2 className="text-2xl font-bold mb-2">Your Projects</h2>
          
          {projects.length === 0 ? (
            <p className="text-gray-500 italic">No projects yet. Create one above!</p>
          ) : (
            projects.map((project) => (
              <div 
                key={project.id} 
                onClick={() => router.push(`/dashboard/project/${project.id}`)}
                className="bg-gray-800 p-5 rounded border border-gray-700 hover:border-purple-500 transition cursor-pointer flex justify-between items-center"
              >
                <div>
                  <h3 className="text-lg font-bold">{project.title}</h3>
                  <span className="text-xs uppercase tracking-wider text-gray-400 bg-gray-900 px-2 py-1 rounded">
                    {project.status}
                  </span>
                </div>
                <div className="text-gray-500 text-sm">
                  {new Date(project.created_at).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}