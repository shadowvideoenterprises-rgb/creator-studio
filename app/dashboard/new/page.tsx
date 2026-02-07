'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { ConceptPicker } from '@/components/ConceptPicker'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ToastProvider'
import Link from 'next/link'

export default function NewProjectPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // Fetch User ID on mount
  useState(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || null))
  })

  const handleConceptSelect = async (title: string) => {
    if (!userId) return;
    setLoading(true);

    try {
        // 1. Create Project Entry
        const { data: project, error } = await supabase
            .from('projects')
            .insert({ 
                user_id: userId, 
                title: title,
                status: 'draft' 
            })
            .select()
            .single();

        if (error) throw error;

        // 2. Generate Initial Script (Auto-kickoff)
        toast("Initializing Project...", "success");
        
        // Redirect to project workspace
        router.push(`/dashboard/project/${project.id}`);

    } catch (e: any) {
        toast("Failed to create project", "error");
        setLoading(false);
    }
  }

  if (!userId) return <div className="p-10 text-white">Loading...</div>

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
            <Link href="/dashboard" className="text-sm text-slate-500 hover:text-white flex items-center gap-2 mb-4 transition-colors">
                <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <h1 className="text-4xl font-black tracking-tight">Create New Project</h1>
            <p className="text-slate-400 mt-2 text-lg">Start with a viral concept or enter your own.</p>
        </div>

        {/* The Strategist UI */}
        <div className="bg-[#121214] border border-white/10 rounded-2xl p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="bg-indigo-500 w-2 h-6 rounded-full"></span>
                Brainstorming Studio
            </h2>
            
            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center text-slate-500">
                    <Loader2 size={48} className="animate-spin mb-4 text-indigo-500" />
                    <p>Setting up your studio...</p>
                </div>
            ) : (
                <ConceptPicker userId={userId} onSelect={handleConceptSelect} />
            )}
        </div>
      </div>
    </div>
  )
}
