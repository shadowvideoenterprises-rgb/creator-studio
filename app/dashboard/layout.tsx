import Link from 'next/link'
import { LayoutDashboard, Settings, PlusCircle, Lightbulb, User, Palette } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
      
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-white/10 p-6 flex flex-col hidden md:flex sticky top-0 h-screen">
        <div className="mb-10 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg animate-pulse" />
            <span className="font-bold text-xl tracking-tight">Creator Studio</span>
        </div>
        
        <nav className="space-y-2 flex-1">
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                <LayoutDashboard size={20} />
                <span className="font-medium">Projects</span>
            </Link>

            <Link href="/dashboard/ideation" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                <Lightbulb size={20} />
                <span className="font-medium">Idea Lab</span>
            </Link>

            {/* NEW LINK */}
            <Link href="/dashboard/brand" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all group">
                <Palette size={20} className="group-hover:text-pink-500 transition-colors" />
                <span className="font-medium group-hover:text-pink-200 transition-colors">Channel DNA</span>
            </Link>

            <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                <Settings size={20} />
                <span className="font-medium">Settings</span>
            </Link>
        </nav>

        <div className="pt-6 border-t border-white/10">
            <button className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                <div className="w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center border border-purple-500/30">
                    <User size={14} className="text-purple-400" />
                </div>
                <div className="text-left">
                    <p className="text-xs font-bold text-white">Pro Plan</p>
                    <p className="text-[10px] text-slate-500">200/500 Credits</p>
                </div>
            </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto relative">
         <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none" />
         {children}
      </main>
    </div>
  )
}
