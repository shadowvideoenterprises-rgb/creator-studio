'use client'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    // If user is already logged in, kick them to dashboard
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) router.push('/dashboard')
    }
    checkUser()

    // Listen for login success
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) router.push('/dashboard')
    })

    return () => subscription.unsubscribe()
  }, [router])

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 p-8 rounded-xl border border-gray-800 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Creator Studio
          </h1>
          <p className="text-gray-400 mt-2">Log in or Sign up to continue</p>
        </div>
        
        <Auth
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#9333ea', // Purple
                  brandAccent: '#7e22ce',
                  inputText: 'white',
                  inputBackground: '#1f2937',
                  inputLabelText: '#9ca3af',
                }
              }
            }
          }}
          theme="dark"
          providers={[]} // Add 'google' here later if you want
        />
      </div>
    </div>
  )
}