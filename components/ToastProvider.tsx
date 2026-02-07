'use client'
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

type ToastType = 'success' | 'error' | 'loading'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = 'success', duration = 3000) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, duration)
    }
  }, [])

  const removeToast = (id: string) => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
        {toasts.map((t) => (
          <div 
            key={t.id} 
            className={`
                min-w-[300px] p-4 rounded-xl border shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-full
                ${t.type === 'success' ? 'bg-[#121214] border-emerald-500/50 text-white' : ''}
                ${t.type === 'error' ? 'bg-[#121214] border-red-500/50 text-white' : ''}
                ${t.type === 'loading' ? 'bg-[#121214] border-blue-500/50 text-white' : ''}
            `}
          >
            {t.type === 'success' && <CheckCircle size={20} className="text-emerald-500" />}
            {t.type === 'error' && <AlertCircle size={20} className="text-red-500" />}
            {t.type === 'loading' && <Loader2 size={20} className="text-blue-500 animate-spin" />}
            
            <p className="text-sm font-bold flex-1">{t.message}</p>
            
            <button onClick={() => removeToast(t.id)} className="text-slate-500 hover:text-white">
                <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within a ToastProvider')
  return context
}
