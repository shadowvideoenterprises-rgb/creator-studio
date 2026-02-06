'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FolderOpen, Settings, Lightbulb, FileText, Image as ImageIcon, Volume2, Rocket, ArrowLeft } from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()
  
  // Check if we are inside a specific project
  // Route format: /dashboard/project/[id]
  const isProjectMode = pathname?.includes('/project/')
  const projectId = isProjectMode ? pathname.split('/')[3] : null

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path)

  return (
    <div className="w-64 h-screen bg-[#0a0a0c] border-r border-white/5 flex flex-col fixed left-0 top-0 z-50">
      
      {/* 1. App Logo / Header */}
      <div className="p-6 h-20 flex items-center border-b border-white/5">
        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3 font-bold text-white">
          AI
        </div>
        <span className="font-bold text-white tracking-tight">Creator Studio</span>
      </div>

      {/* 2. Navigation Items */}
      <div className="flex-1 overflow-y-auto py-6 space-y-2 px-3">
        
        {/* GLOBAL MENU */}
        <div className="mb-8">
           <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Workspace</p>
           <Link href="/dashboard" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${pathname === '/dashboard' ? 'bg-purple-500/10 text-purple-400' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}>
             <LayoutDashboard size={18} />
             <span>Dashboard</span>
           </Link>
           <Link href="/dashboard/projects" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${pathname === '/dashboard/projects' ? 'bg-purple-500/10 text-purple-400' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}>
             <FolderOpen size={18} />
             <span>All Projects</span>
           </Link>
        </div>

        {/* CONTEXT MENU (Only shows when inside a project) */}
        {isProjectMode && projectId && (
          <div className="animate-in slide-in-from-left-5 duration-300">
             <div className="px-3 mb-2 flex justify-between items-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Project</p>
                <Link href="/dashboard" className="text-[10px] text-purple-400 hover:underline">Exit</Link>
             </div>
             
             <div className="space-y-0.5">
               <NavItem href={`/dashboard/project/${projectId}/idea`} icon={<Lightbulb size={18} />} label="Idea Lab" active={pathname.includes('/idea')} />
               <NavItem href={`/dashboard/project/${projectId}`} icon={<FileText size={18} />} label="Script" active={pathname === `/dashboard/project/${projectId}`} />
               <NavItem href={`/dashboard/project/${projectId}/visuals`} icon={<ImageIcon size={18} />} label="Visuals" active={pathname.includes('/visuals')} />
               <NavItem href={`/dashboard/project/${projectId}/audio`} icon={<Volume2 size={18} />} label="Audio" active={pathname.includes('/audio')} />
               <NavItem href={`/dashboard/project/${projectId}/launch`} icon={<Rocket size={18} />} label="Launch" active={pathname.includes('/launch')} />
             </div>
          </div>
        )}

      </div>

      {/* 3. Bottom Actions */}
      <div className="p-4 border-t border-white/5">
        <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
          <Settings size={18} />
          <span>Settings</span>
        </Link>
      </div>
    </div>
  )
}

function NavItem({ href, icon, label, active }: { href: string; icon: any; label: string; active: boolean }) {
  return (
    <Link href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}>
      {icon}
      <span>{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />}
    </Link>
  )
}
