'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import StatusBadge from '@/components/StatusBadge';
import { supabase } from '@/lib/supabaseClient'

export default function Dashboard() {
  const router = useRouter()
  const [projects, setProjects] = useState<any[]>([])

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
      if (data) setProjects(data)
    }
    fetchProjects()
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
            <h1 className="text-3xl font-bold">Creator Studio</h1>
            <button
                onClick={() => router.push('/dashboard/ideation')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 rounded-lg font-bold shadow-lg hover:shadow-purple-500/20 transition-all transform hover:scale-105"
            >
                ✨ New AI Project
            </button>
        </div>

        {/* Project List */}
        <div className="grid md:grid-cols-3 gap-6">
            {/* Create New Card (Shortcut) */}
            <div
                onClick={() => router.push('/dashboard/ideation')}
                className="border-2 border-dashed border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-gray-900 transition-all group min-h-[200px]"
            >
                <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">💡</span>
                <span className="font-bold text-gray-400 group-hover:text-white">Generate New Idea</span>
            </div>

            {/* Existing Projects */}
            {projects.map((p) => (
                <div
                    key={p.id}
                    onClick={() => router.push(`/dashboard/project/${p.id}`)}
                    className="bg-gray-900 border border-gray-800 rounded-xl p-6 cursor-pointer hover:border-gray-600 transition-all hover:shadow-xl flex flex-col justify-between"
                >
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-blue-900/30 text-blue-400 text-xs px-2 py-1 rounded font-bold uppercase">
                                {p.status || 'Draft'}
                            </div>
                            <span className="text-gray-500 text-xs">{new Date(p.created_at).toLocaleDateString()}</span>
                        </div>
                        <h3 className="font-bold text-lg mb-2 truncate">{p.title}</h3>
                        <p className="text-gray-400 text-sm line-clamp-2 h-[40px]">
                            {p.content ? "Script generated" : "Empty project"}
                        </p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-800 space-y-3">
                        <StatusBadge status="Complete" label="Ideate" />
                        <StatusBadge status="Not Started" label="Write" />
                        <StatusBadge status="In Progress" label="Visualize" />
                        <StatusBadge status="Coming Soon" label="Launch" />
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  )
}