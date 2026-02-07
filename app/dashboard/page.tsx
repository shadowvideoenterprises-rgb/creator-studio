'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Plus, Search, MoreVertical, Trash2, Calendar, Clock, Video, FileText, Image as ImageIcon } from 'lucide-react'
import { useToast } from '@/components/ToastProvider'

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => { fetchProjects() }, [])

  const fetchProjects = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
    
    if (data) setProjects(data)
    setLoading(false)
  }

  const handleCreate = async () => {
    setCreating(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    // Create empty project shell
    const { data, error } = await supabase.from('projects').insert({
        user_id: user?.id,
        title: 'Untitled Project',
        description: '',
        status: 'draft'
    }).select().single()

    if (data) {
        toast("Project initialized", "success")
        router.push(`/dashboard/project/${data.id}`)
    } else {
        toast("Failed to create", "error")
        setCreating(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation() // Prevent clicking the card
    if (!confirm("Are you sure? This cannot be undone.")) return

    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (!error) {
        setProjects(projects.filter(p => p.id !== id))
        toast("Project deleted", "success")
    } else {
        toast("Delete failed", "error")
    }
  }

  const filteredProjects = projects.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <div className="p-20 text-center text-slate-500">Loading Studio...</div>

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen animate-in fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div>
              <h1 className="text-4xl font-black text-white mb-2">My Projects</h1>
              <p className="text-slate-400">Manage your creative library</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18}/>
                  <input 
                    type="text" 
                    placeholder="Search projects..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-[#121214] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
              </div>
              <button 
                onClick={handleCreate}
                disabled={creating}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-900/20 disabled:opacity-50"
              >
                  <Plus size={20} /> New Project
              </button>
          </div>
      </div>

      {/* Grid */}
      {filteredProjects.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl bg-white/5">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video size={32} className="text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No projects yet</h3>
              <p className="text-slate-400 mb-6">Start your first viral video today.</p>
              <button onClick={handleCreate} className="text-indigo-400 hover:text-indigo-300 font-bold">Create Project &rarr;</button>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProjects.map(project => (
                  <div 
                    key={project.id}
                    onClick={() => router.push(`/dashboard/project/${project.id}`)}
                    className="group bg-[#121214] border border-white/5 rounded-2xl overflow-hidden hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-900/10 transition-all cursor-pointer relative"
                  >
                      {/* Thumbnail Aspect Ratio */}
                      <div className="aspect-video bg-black/50 relative overflow-hidden">
                          {project.thumbnail_url ? (
                              <img src={project.thumbnail_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                          ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900/20 to-purple-900/20">
                                  <ImageIcon size={32} className="text-white/10" />
                              </div>
                          )}
                          
                          {/* Overlay Status Badge */}
                          <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-white uppercase tracking-wider border border-white/10">
                              {project.target_duration || 'Draft'}
                          </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                          <h3 className="font-bold text-lg text-white mb-1 truncate">{project.title}</h3>
                          <p className="text-xs text-slate-500 mb-4 line-clamp-2 min-h-[2.5em]">
                              {project.description || 'No description provided.'}
                          </p>
                          
                          <div className="flex justify-between items-center pt-4 border-t border-white/5">
                              <div className="flex items-center gap-2 text-slate-500 text-xs">
                                  <Clock size={12} />
                                  <span>{new Date(project.updated_at).toLocaleDateString()}</span>
                              </div>
                              <button 
                                onClick={(e) => handleDelete(e, project.id)}
                                className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              >
                                  <Trash2 size={14} />
                              </button>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  )
}
