'use client'
import { AlertTriangle, Trash2 } from 'lucide-react'

interface DeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isDeleting: boolean
  title?: string
}

export default function DeleteModal({ isOpen, onClose, onConfirm, isDeleting, title }: DeleteModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#121214] border border-red-500/20 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
             <AlertTriangle size={32} className="text-red-500" />
          </div>
          
          <h2 className="text-xl font-bold text-white">Delete this Project?</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            You are about to delete <strong>"{title || 'this project'}"</strong>. 
            <br/>This action cannot be undone. All scripts, scenes, and generated assets will be lost forever.
          </p>
        </div>

        <div className="bg-red-500/5 p-4 flex gap-3">
           <button 
             onClick={onClose}
             disabled={isDeleting}
             className="flex-1 py-3 bg-transparent border border-white/10 text-white rounded-xl font-bold hover:bg-white/5 transition"
           >
             Cancel
           </button>
           <button 
             onClick={onConfirm}
             disabled={isDeleting}
             className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition flex items-center justify-center gap-2"
           >
             {isDeleting ? 'Deleting...' : <><Trash2 size={18} /> Delete Forever</>}
           </button>
        </div>
      </div>
    </div>
  )
}