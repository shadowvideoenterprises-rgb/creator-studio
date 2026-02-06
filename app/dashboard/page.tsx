'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Settings, Video, Loader2, Trash2 } from 'lucide-react'
import DeleteModal from '@/components/modals/DeleteModal'

export default function Dashboard() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  
  // Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteTitle, setDeleteTitle] = useState<string>('')
  const [isDeleting, setIsDeleting] = useState(false)
  
  const router = useRouter()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) setProjects(data)
    setLoading(false)
  }

  const handleCreate = async () => {
    setCreating(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        title: 'Untitled Project ' + new Date().toLocaleTimeString(),
        status: 'draft',
        marketing_data: {}
      })
      .select()
      .single()

    if (data) router.push(`/dashboard/project/${data.id}`)
    setCreating(false)
  }

  const confirmDelete = (e: React.MouseEvent, project: any) => {
    e.preventDefault()
    e.stopPropagation()
    setDeleteId(project.id)
    setDeleteTitle(project.title)
  }

  const executeDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    
    await supabase.from('projects').delete().eq('id', deleteId)
    
    setProjects(projects.filter(p => p.id !== deleteId))
    setIsDeleting(false)
    setDeleteId(null)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 p-8">
      
      <DeleteModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={executeDelete} 
        isDeleting={isDeleting}
        title={deleteTitle}
      />

      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center border-b border-white/5 pb-8">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Creator Studio</h1>
            <p className="text-slate-500">Manage your viral video projects</p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/settings" className="p-3 bg-white/5 border border-white/10 text-slate-400 rounded-xl hover:bg-white/10 hover:text-white transition">
              <Settings size={20} />
            </Link>
            <button onClick={handleCreate} disabled={creating} className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-purple-400 transition flex items-center gap-2">
              {creating ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
              New Project
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500 animate-pulse">Loading workspace...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/5">
            <Video size={48} className="mx-auto mb-4 text-slate-600" />
            <h3 className="text-xl font-bold text-white mb-2">No projects yet</h3>
            <p className="text-slate-500 mb-6">Create your first video to get started</p>
            <button onClick={handleCreate} className="px-6 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition">Create Project</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link 
                key={project.id} 
                href={`/dashboard/project/${project.id}`}
                className="group relative bg-[#121214] border border-white/5 p-6 rounded-3xl hover:border-purple-500/50 transition-all hover:-translate-y-1 block"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                    project.status === 'completed' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-blue-500/20 text-blue-500'
                  }`}>
                    {project.status}
                  </div>
                  <button 
                    onClick={(e) => confirmDelete(e, project)}
                    className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-full transition z-10"
                    title="Delete Project"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition">{project.title}</h3>
                <p className="text-sm text-slate-500 line-clamp-2">{project.description || 'No description'}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
