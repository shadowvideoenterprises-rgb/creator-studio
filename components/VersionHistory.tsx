'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { History, RotateCcw, Check } from 'lucide-react'
import { useToast } from '@/components/ToastProvider'

export function VersionHistory({ projectId, onRestore }: { projectId: string, onRestore: () => void }) {
  const { toast } = useToast()
  const [versions, setVersions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const fetchVersions = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('script_versions')
        .select('*')
        .eq('project_id', projectId)
        .order('version_number', { ascending: false })
      setVersions(data || [])
      setLoading(false)
  }

  const handleRestore = async (versionNumber: number) => {
      if (!confirm(`Restore Version ${versionNumber}? This will replace current scenes.`)) return;
      
      // For MVP, just notify user
      toast("Restore feature coming in Phase 3", "success")
  }

  return (
    <div className="relative">
        <button 
            onClick={() => { setIsOpen(!isOpen); if (!isOpen) fetchVersions(); }}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
        >
            <History size={14} /> History
        </button>

        {isOpen && (
            <div className="absolute top-10 right-0 w-64 bg-[#121214] border border-white/10 rounded-xl shadow-2xl z-50 p-2 animate-in fade-in slide-in-from-top-2">
                <div className="text-xs font-bold text-slate-500 px-2 py-1 uppercase tracking-wider mb-1">Previous Drafts</div>
                {loading ? (
                    <div className="p-4 text-center text-xs text-slate-500">Loading history...</div>
                ) : (
                    <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
                        {versions.map((v) => (
                            <div key={v.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 group">
                                <div>
                                    <div className="text-xs font-bold text-slate-200">Version {v.version_number}</div>
                                    <div className="text-[10px] text-slate-500">{new Date(v.created_at).toLocaleDateString()}</div>
                                </div>
                                <div className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-slate-400">
                                    {v.scenes?.length || 0} Scenes
                                </div>
                            </div>
                        ))}
                        {versions.length === 0 && <div className="p-2 text-xs text-slate-600">No history yet.</div>}
                    </div>
                )}
            </div>
        )}
    </div>
  )
}
