'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Plus, Trash2, Search, Clock, MoreVertical, X, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function Dashboard() {
  const router = useRouter()
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Delete Modal State
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')

    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (data) setProjects(data)
    setLoading(false)
  }

  const createNewProject = async () => {
      // Create a blank project and redirect
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase.from('projects').insert({
          user_id: user.id,
          title: "Untitled Project",
          status: 'draft'
      }).select().single()

      if (data) router.push(`/dashboard/project/${data.id}`)
  }

  const confirmDelete = async () => {
      if (!deleteId) return
      await supabase.from('projects').delete().eq('id', deleteId)
      setProjects(projects.filter(p => p.id !== deleteId))
      setDeleteId(null)
  }

  if (loading) return <div className="p-20 text-center text-slate-500 animate-pulse">Loading Studio...</div>

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Projects</h1>
            <p className="text-slate-400">Manage your video pipeline</p>
          </div>
          <div className="flex gap-3">
              <Link href="/dashboard/ideation" className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-bold flex items-center gap-2 transition-all">
                  <span>💡 Ideation</span>
              </Link>
              <button onClick={createNewProject} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-purple-900/20">
                  <Plus size={18} /> <span>New Project</span>
              </button>
          </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
              <div key={project.id} className="group bg-[#121214] border border-white/5 hover:border-purple-500/30 rounded-2xl p-5 transition-all relative">
                  <Link href={`/dashboard/project/${project.id}`} className="block">
                      <div className="flex justify-between items-start mb-4">
                          <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                              {project.settings?.format === '9:16' ? <div className="w-4 h-6 border-2 border-current rounded-sm"/> : <div className="w-6 h-4 border-2 border-current rounded-sm"/>}
                          </div>
                          <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${project.status === 'done' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-white/5 border-white/10 text-slate-500'}`}>
                              {project.status}
                          </span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-1 truncate">{project.title}</h3>
                      <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10">{project.description || "No description provided."}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                          <Clock size={12} />
                          <span>{new Date(project.created_at).toLocaleDateString()}</span>
                      </div>
                  </Link>

                  {/* Delete Button (Absolute) */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); setDeleteId(project.id); }}
                    className="absolute top-4 right-4 p-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                      <Trash2 size={16} />
                  </button>
              </div>
          ))}
      </div>

      {projects.length === 0 && (
          <div className="text-center py-20 text-slate-600 border-2 border-dashed border-white/5 rounded-3xl">
              <p>No projects yet. Start by Brainstorming!</p>
          </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteId && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-[#1a1a20] border border-red-500/20 p-6 rounded-2xl max-w-sm w-full shadow-2xl animate-in zoom-in-95">
                  <div className="flex flex-col items-center text-center gap-4">
                      <div className="p-3 bg-red-500/10 rounded-full text-red-500">
                          <AlertTriangle size={32} />
                      </div>
                      <div>
                          <h3 className="text-xl font-bold text-white">Delete Project?</h3>
                          <p className="text-slate-400 text-sm mt-1">This action cannot be undone. All scripts and assets will be lost.</p>
                      </div>
                      <div className="flex gap-3 w-full mt-2">
                          <button onClick={() => setDeleteId(null)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-xl transition-all">Cancel</button>
                          <button onClick={confirmDelete} className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all">Delete</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

    </div>
  )
}
