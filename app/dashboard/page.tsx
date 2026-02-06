'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { Plus, Trash2 } from 'lucide-react'

export default function Dashboard() {
  const [projects, setProjects] = useState<any[]>([])

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    if (data) setProjects(data)
  }

  const deleteProject = async (id: string) => {
    if (!confirm('Are you sure?')) return
    await supabase.from('projects').delete().eq('id', id)
    fetchProjects()
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Creator Studio</h1>
          <p className="text-slate-400">Manage your viral video projects</p>
        </div>
        <Link href="/dashboard/create">
          <button className="bg-white text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-200 transition">
            <Plus size={18} /> New Project
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="bg-[#121214] border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition group relative">
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition">
               <button onClick={(e) => { e.preventDefault(); deleteProject(project.id) }} className="p-2 text-slate-600 hover:text-red-500">
                 <Trash2 size={16} />
               </button>
            </div>
            
            <Link href={`/dashboard/project/${project.id}`} className="block">
              <div className="mb-4">
                 <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest ${project.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                   {project.status || 'Draft'}
                 </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{project.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-2">{project.description || 'No description'}</p>
            </Link>
          </div>
        ))}

        {projects.length === 0 && (
          <div className="col-span-full py-20 text-center border border-dashed border-white/10 rounded-xl">
             <p className="text-slate-500 mb-4">No projects found</p>
             <Link href="/dashboard/create">
               <button className="text-purple-400 hover:underline">Create your first one</button>
             </Link>
          </div>
        )}
      </div>
    </div>
  )
}
