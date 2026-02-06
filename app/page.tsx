'use client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabaseClient'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white p-4">
      <div className="w-full max-w-md space-y-8">
        
        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Creator Studio
          </h1>
          <p className="mt-2 text-gray-400">
            Your all-in-one content management hub.
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 shadow-xl">
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            theme="dark"
            providers={[]} // We will add Google later
            redirectTo="http://localhost:3000/dashboard"
          />
        </div>

      </div>
    </main>
  )
}