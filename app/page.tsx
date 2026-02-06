import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      
      {/* Hero Section */}
      <div className="max-w-4xl text-center space-y-8">
        
        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
          Creator Studio
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto">
          The all-in-one AI platform for modern creators.
          <br />
          <span className="text-white font-bold">Ideate. Write. Visualize. Launch.</span>
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center mt-10">
          
          {/* Main Sign Up / Login Button */}
          <Link 
            href="/login" 
            className="px-8 py-4 bg-white text-black text-lg font-bold rounded-full hover:scale-105 transition-transform shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
          >
            Get Started For Free
          </Link>

          <Link 
            href="/login" 
            className="px-8 py-4 bg-gray-900 text-gray-300 text-lg font-bold rounded-full border border-gray-800 hover:bg-gray-800 transition-colors"
          >
            Log In
          </Link>
          
        </div>

      </div>

      {/* Footer / Trust Badge */}
      <div className="absolute bottom-10 text-gray-600 text-sm">
        Powered by Gemini & Supabase
      </div>

    </div>
  )
}