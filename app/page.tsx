'use client'
import Link from 'next/link'
import { ArrowRight, Check, Zap, Video, Image as ImageIcon, Mic2, Sparkles, PlayCircle, Layers } from 'lucide-react'
import { useState } from 'react'

export default function LandingPage() {
  const [videoModalOpen, setVideoModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      
      {/* 1. NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-2 font-black text-xl tracking-tighter">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Video size={16} className="text-white" />
                </div>
                <span>Studio<span className="text-indigo-500">AI</span></span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-400">
                <a href="#features" className="hover:text-white transition-colors">Features</a>
                <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
                <a href="#showcase" className="hover:text-white transition-colors">Showcase</a>
            </div>
            <div className="flex items-center gap-4">
                <Link href="/login" className="text-sm font-bold text-white hover:text-indigo-400">Log In</Link>
                <Link href="/dashboard" className="px-5 py-2.5 bg-white text-black font-bold rounded-full text-sm hover:bg-indigo-50 transition-all flex items-center gap-2">
                    Start Creating <ArrowRight size={14} />
                </Link>
            </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden">
         {/* Background Glow */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] -z-10 animate-pulse"></div>

         <div className="max-w-5xl mx-auto text-center space-y-8">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-indigo-300 uppercase tracking-wide mb-4 animate-in fade-in slide-in-from-bottom-4">
                 <Sparkles size={12} /> The Future of Content Creation
             </div>
             
             <h1 className="text-6xl md:text-8xl font-black tracking-tight text-white leading-[0.9] animate-in fade-in slide-in-from-bottom-6 duration-700">
                 Turn Ideas into <br />
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Viral Videos.</span>
             </h1>
             
             <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000">
                 The world's first end-to-end AI Studio. 
                 Write scripts, generate visuals, synthesize voiceovers, and edit your masterpiece in one dashboard.
             </p>
             
             <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                 <Link href="/dashboard" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg rounded-2xl shadow-2xl shadow-indigo-900/40 transition-all hover:scale-105 flex items-center gap-3">
                     <Zap size={20} /> Generate Video (Free)
                 </Link>
                 <button className="px-8 py-4 bg-[#121214] border border-white/10 hover:border-white/20 text-white font-bold text-lg rounded-2xl transition-all flex items-center gap-3 group">
                     <PlayCircle size={20} className="text-slate-500 group-hover:text-white transition-colors" /> Watch Demo
                 </button>
             </div>
             
             <p className="text-xs text-slate-600 font-bold uppercase tracking-widest pt-4">No Credit Card Required • 100 Free Credits</p>
         </div>

         {/* Hero Dashboard Preview */}
         <div className="max-w-6xl mx-auto mt-20 relative animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
             <div className="absolute -inset-1 bg-gradient-to-b from-indigo-500 to-transparent opacity-20 blur-xl rounded-3xl"></div>
             <div className="relative bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                 <div className="h-12 bg-[#121214] border-b border-white/5 flex items-center px-4 gap-2">
                     <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                     <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                     <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
                     <div className="mx-auto text-xs font-mono text-slate-500">studio.ai/project/viral-clip-01</div>
                 </div>
                 {/* Fake UI Preview */}
                 <div className="grid grid-cols-12 h-[600px]">
                     <div className="col-span-2 border-r border-white/5 p-4 space-y-4">
                         <div className="h-10 w-10 bg-indigo-500/20 rounded-lg flex items-center justify-center"><Video size={20} className="text-indigo-400"/></div>
                         <div className="h-10 w-10 bg-white/5 rounded-lg flex items-center justify-center"><ImageIcon size={20} className="text-slate-500"/></div>
                         <div className="h-10 w-10 bg-white/5 rounded-lg flex items-center justify-center"><Mic2 size={20} className="text-slate-500"/></div>
                     </div>
                     <div className="col-span-10 p-8 flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center">
                         <div className="bg-black/80 backdrop-blur-md p-6 rounded-2xl border border-white/10 max-w-md text-center">
                             <h3 className="text-2xl font-bold text-white mb-2">Generating Scene 3...</h3>
                             <div className="w-64 h-2 bg-white/10 rounded-full mx-auto overflow-hidden">
                                 <div className="h-full w-3/4 bg-indigo-500 rounded-full"></div>
                             </div>
                             <p className="text-xs text-slate-400 mt-4 font-mono">Rendering AI Voice: "The ancient pyramids were not just tombs..."</p>
                         </div>
                     </div>
                 </div>
             </div>
         </div>
      </section>

      {/* 3. FEATURES GRID */}
      <section id="features" className="py-32 bg-[#050505]">
          <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-20">
                  <h2 className="text-4xl font-black text-white mb-4">One Tool. Infinite Stories.</h2>
                  <p className="text-slate-400 max-w-2xl mx-auto">Stop juggling ChatGPT, Midjourney, and ElevenLabs. We combined them all into one workflow.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Card 1 */}
                  <div className="p-8 bg-[#121214] border border-white/5 rounded-3xl hover:border-indigo-500/30 transition-all group">
                      <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                          <Layers size={28} className="text-indigo-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">AI Script Writer</h3>
                      <p className="text-slate-400 leading-relaxed">
                          Just type a topic like "Space Mysteries." Our engine researches the facts, writes a hook, and structures a perfect 60-second script optimized for retention.
                      </p>
                  </div>

                  {/* Card 2 */}
                  <div className="p-8 bg-[#121214] border border-white/5 rounded-3xl hover:border-purple-500/30 transition-all group">
                      <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                          <ImageIcon size={28} className="text-purple-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">Dynamic Visuals</h3>
                      <p className="text-slate-400 leading-relaxed">
                          Automatically generates consistent characters and scenes. Change style from "Cinematic" to "Anime" with one click using our Batch Director.
                      </p>
                  </div>

                  {/* Card 3 */}
                  <div className="p-8 bg-[#121214] border border-white/5 rounded-3xl hover:border-pink-500/30 transition-all group">
                      <div className="w-14 h-14 bg-pink-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                          <Mic2 size={28} className="text-pink-400" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">Pro Voiceovers</h3>
                      <p className="text-slate-400 leading-relaxed">
                          Integrated with ElevenLabs for hyper-realistic narration. No robotic voices here. Choose from 50+ emotions and accents instantly.
                      </p>
                  </div>
              </div>
          </div>
      </section>

      {/* 4. PRICING */}
      <section id="pricing" className="py-32 px-6">
          <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                  <h2 className="text-4xl font-black text-white mb-4">Simple, Transparent Pricing.</h2>
                  <p className="text-slate-400">Pay as you go. No hidden subscriptions.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  {/* Free Plan */}
                  <div className="p-10 bg-[#121214] border border-white/5 rounded-3xl">
                      <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
                      <div className="text-4xl font-black text-white mb-6">$0</div>
                      <p className="text-slate-400 mb-8 border-b border-white/5 pb-8">Perfect for trying out the engine.</p>
                      
                      <ul className="space-y-4 mb-8">
                          <li className="flex items-center gap-3 text-slate-300"><Check size={16} className="text-indigo-500"/> 100 Free Credits</li>
                          <li className="flex items-center gap-3 text-slate-300"><Check size={16} className="text-indigo-500"/> ~2 Videos</li>
                          <li className="flex items-center gap-3 text-slate-300"><Check size={16} className="text-indigo-500"/> Standard Quality</li>
                          <li className="flex items-center gap-3 text-slate-300"><Check size={16} className="text-indigo-500"/> Watermarked Export</li>
                      </ul>
                      
                      <Link href="/dashboard" className="block w-full py-4 text-center bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all">
                          Start for Free
                      </Link>
                  </div>

                  {/* Pro Plan */}
                  <div className="p-10 bg-indigo-900/10 border border-indigo-500/50 rounded-3xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-4 py-1 rounded-bl-xl uppercase tracking-widest">Most Popular</div>
                      
                      <h3 className="text-2xl font-bold text-white mb-2">Creator Pack</h3>
                      <div className="text-4xl font-black text-white mb-6">$10</div>
                      <p className="text-slate-400 mb-8 border-b border-indigo-500/20 pb-8">For serious YouTubers.</p>
                      
                      <ul className="space-y-4 mb-8">
                          <li className="flex items-center gap-3 text-white"><Check size={16} className="text-indigo-400"/> 500 Credits</li>
                          <li className="flex items-center gap-3 text-white"><Check size={16} className="text-indigo-400"/> ~10 Videos</li>
                          <li className="flex items-center gap-3 text-white"><Check size={16} className="text-indigo-400"/> 4K Image Upscaling</li>
                          <li className="flex items-center gap-3 text-white"><Check size={16} className="text-indigo-400"/> Commercial Rights</li>
                      </ul>
                      
                      <Link href="/dashboard" className="block w-full py-4 text-center bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/40 transition-all hover:scale-105">
                          Get Started
                      </Link>
                  </div>
              </div>
          </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="py-12 border-t border-white/5 bg-[#050505]">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-slate-500 font-bold text-sm">
                  &copy; 2026 StudioAI. Built for Creators.
              </div>
              <div className="flex gap-6 text-slate-500 text-sm font-bold">
                  <a href="#" className="hover:text-white">Twitter</a>
                  <a href="#" className="hover:text-white">Discord</a>
                  <a href="#" className="hover:text-white">Terms</a>
              </div>
          </div>
      </footer>
    </div>
  )
}
