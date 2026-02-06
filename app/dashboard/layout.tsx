import Sidebar from '@/components/layout/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-[#0a0a0c]">
      {/* 1. Fixed Sidebar */}
      <Sidebar />

      {/* 2. Main Content Area (Pushed right by 16rem/64px) */}
      <main className="flex-1 ml-64 min-h-screen">
        {children}
      </main>
    </div>
  )
}
