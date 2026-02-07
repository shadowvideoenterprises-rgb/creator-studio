'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Search, Loader2, Save, Trash2, CheckCircle, Fingerprint, ArrowRight, Zap, MonitorPlay, MessageSquare, Image as ImageIcon } from 'lucide-react'
import { useToast } from '@/components/ToastProvider'
import Link from 'next/link'

export default function DnaLabPage() {
  const { toast } = useToast()
  const [userId, setUserId] = useState<string | null>(null)
  
  // Brand Identity State
  const [brand, setBrand] = useState({
    channel_name: '',
    channel_handle: '',
    channel_logo: '',
    default_intro: '',
    default_outro: ''
  })

  // DNA State
  const [activeDna, setActiveDna] = useState<any>(null)
  const [library, setLibrary] = useState<any[]>([])
  
  // Analysis State
  const [competitorName, setCompetitorName] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
            setUserId(data.user.id)
            fetchSettings(data.user.id)
            fetchLibrary(data.user.id)
        }
    })
  }, [])

  const fetchSettings = async (uid: string) => {
      const { data } = await supabase.from('user_settings').select('*').eq('user_id', uid).single();
      if (data) {
          if (data.channel_dna) setActiveDna(data.channel_dna);
          setBrand({
            channel_name: data.channel_name || '',
            channel_handle: data.channel_handle || '',
            channel_logo: data.channel_logo || '',
            default_intro: data.default_intro || '',
            default_outro: data.default_outro || ''
          })
      }
  }

  const saveBrand = async () => {
      const { error } = await supabase.from('user_settings').update(brand).eq('user_id', userId);
      if (error) toast("Failed to save brand", "error");
      else toast("Brand Identity Saved", "success");
  }

  const fetchLibrary = async (uid: string) => {
      const res = await fetch(`/api/dna/library?userId=${uid}`);
      const data = await res.json();
      if (data.library) setLibrary(data.library);
  }

  const analyzeCompetitor = async () => {
    if (!competitorName || !userId) return;
    setAnalyzing(true);
    setAnalysisResult(null);
    try {
        const res = await fetch('/api/analyze/dna', {
            method: 'POST',
            body: JSON.stringify({ channelName: competitorName, userId })
        });
        const data = await res.json();
        if (data.success) {
            setAnalysisResult(data.dna);
            toast(`Analyzed ${competitorName}`, "success");
        } else {
            toast(data.error || "Analysis Failed", "error");
        }
    } catch (e) { toast("Network Error", "error"); }
    setAnalyzing(false);
  }

  const saveToLibrary = async () => {
      if (!analysisResult || !competitorName) return;
      const res = await fetch('/api/dna/library', {
          method: 'POST',
          body: JSON.stringify({ userId, name: competitorName, dna: analysisResult })
      });
      const data = await res.json();
      if (data.success) {
          setLibrary([data.entry, ...library]);
          setAnalysisResult(null);
          setCompetitorName('');
          toast("Saved to Library", "success");
      }
  }

  const activateDna = async (dna: any) => {
      const { error } = await supabase.from('user_settings').update({ channel_dna: dna }).eq('user_id', userId);
      if (!error) {
          setActiveDna(dna);
          toast("DNA Activated", "success");
      }
  }

  const deleteDna = async (id: string) => {
      if (!confirm("Delete this DNA profile?")) return;
      await fetch(`/api/dna/library?id=${id}`, { method: 'DELETE' });
      setLibrary(library.filter(l => l.id !== id));
  }

  if (!userId) return <div className="p-10 text-white">Loading Studio...</div>

  return (
    <div className="min-h-screen bg-black text-white p-8 pb-32">
       <div className="max-w-5xl mx-auto space-y-12">
          
          {/* Header */}
          <div className="flex justify-between items-center">
             <div>
                 <Link href="/dashboard" className="text-slate-500 hover:text-white text-sm flex items-center gap-1 mb-2"><ArrowRight className="rotate-180" size={14}/> Back</Link>
                 <h1 className="text-4xl font-black">Identity Lab</h1>
                 <p className="text-slate-400 mt-2">Define who you are. The AI will become you.</p>
             </div>
          </div>

          {/* 1. BRAND BIBLE (NEW) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* Left: Core Identity */}
             <div className="lg:col-span-1 bg-[#121214] border border-white/10 rounded-2xl p-6 space-y-6">
                <h2 className="text-lg font-bold flex items-center gap-2"><MonitorPlay size={18} className="text-indigo-400"/> Channel Profile</h2>
                
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Channel Name</label>
                    <input 
                        value={brand.channel_name}
                        onChange={(e) => setBrand({...brand, channel_name: e.target.value})}
                        placeholder="e.g. TechQuickie"
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Handle (@)</label>
                    <input 
                        value={brand.channel_handle}
                        onChange={(e) => setBrand({...brand, channel_handle: e.target.value})}
                        placeholder="@techquickie"
                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Logo URL</label>
                    <div className="flex gap-2">
                        <input 
                            value={brand.channel_logo}
                            onChange={(e) => setBrand({...brand, channel_logo: e.target.value})}
                            placeholder="https://..."
                            className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none text-xs"
                        />
                        {brand.channel_logo && <img src={brand.channel_logo} alt="Logo" className="w-10 h-10 rounded-full border border-white/10" />}
                    </div>
                </div>
             </div>

             {/* Right: Signature Moves */}
             <div className="lg:col-span-2 bg-[#121214] border border-white/10 rounded-2xl p-6 space-y-6 relative">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold flex items-center gap-2"><MessageSquare size={18} className="text-indigo-400"/> Script Signatures</h2>
                    <button onClick={saveBrand} className="px-4 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-slate-200 flex items-center gap-2">
                        <Save size={14} /> Save Brand
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Standard Intro Hook</label>
                        <textarea 
                            value={brand.default_intro}
                            onChange={(e) => setBrand({...brand, default_intro: e.target.value})}
                            placeholder="e.g. 'What is up guys, welcome back!'"
                            className="w-full h-32 bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none resize-none text-sm"
                        />
                        <p className="text-[10px] text-slate-500 mt-1">AI will start every script with this.</p>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Standard Outro / CTA</label>
                        <textarea 
                            value={brand.default_outro}
                            onChange={(e) => setBrand({...brand, default_outro: e.target.value})}
                            placeholder="e.g. 'Smash like and subscribe for more!'"
                            className="w-full h-32 bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-indigo-500 outline-none resize-none text-sm"
                        />
                        <p className="text-[10px] text-slate-500 mt-1">AI will end every script with this.</p>
                    </div>
                </div>
             </div>
          </div>

          <div className="border-t border-white/5 pt-8">
            <h2 className="text-2xl font-black mb-8">Competitor DNA</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 2. EXTRACTION CHAMBER */}
                <div className="lg:col-span-2 bg-[#121214] border border-white/10 rounded-2xl p-8">
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                        <Zap className="text-yellow-400" /> Competitor Extraction
                    </h2>
                    
                    <div className="flex gap-4 mb-8">
                        <input 
                            value={competitorName}
                            onChange={(e) => setCompetitorName(e.target.value)}
                            placeholder="Enter YouTube Channel Name..."
                            className="flex-1 bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-indigo-500 outline-none text-lg"
                            onKeyDown={(e) => e.key === 'Enter' && analyzeCompetitor()}
                        />
                        <button 
                            onClick={analyzeCompetitor}
                            disabled={analyzing || !competitorName}
                            className="px-8 bg-white text-black font-bold rounded-xl flex items-center gap-2 hover:bg-slate-200 transition-colors"
                        >
                            {analyzing ? <Loader2 className="animate-spin" /> : "Extract"}
                        </button>
                    </div>

                    {/* Analysis Result Preview */}
                    {analysisResult && (
                        <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-xl p-6 animate-in slide-in-from-top-4">
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div><span className="text-xs text-indigo-300 font-bold uppercase">Audience</span><p className="font-medium text-sm">{analysisResult.audience}</p></div>
                                <div><span className="text-xs text-indigo-300 font-bold uppercase">Tone</span><p className="font-medium text-sm">{analysisResult.tone}</p></div>
                                <div><span className="text-xs text-indigo-300 font-bold uppercase">Style</span><p className="font-medium text-sm">{analysisResult.style}</p></div>
                                <div><span className="text-xs text-indigo-300 font-bold uppercase">Pacing</span><p className="font-medium text-sm">{analysisResult.pacing}</p></div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setAnalysisResult(null)} className="px-4 py-2 text-sm text-slate-400 hover:text-white">Discard</button>
                                <button onClick={saveToLibrary} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg flex items-center gap-2">
                                    <Save size={16} /> Save
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. DNA LIBRARY & ACTIVE STATUS */}
                <div className="space-y-6">
                    <div className="p-6 bg-indigo-900/20 border border-indigo-500/30 rounded-2xl">
                        <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Currently Active Style</div>
                        {activeDna ? (
                            <div className="space-y-1">
                                <div className="font-bold text-white text-xl">{activeDna.tone}</div>
                                <div className="text-xs text-slate-400">Targeting: {activeDna.audience}</div>
                            </div>
                        ) : (
                            <div className="text-sm text-slate-500">Using System Default</div>
                        )}
                    </div>

                    <div>
                        <h3 className="font-bold text-slate-400 uppercase text-xs mb-4">Saved Profiles</h3>
                        {library.length === 0 ? (
                            <div className="text-center py-6 text-slate-600 border border-dashed border-white/10 rounded-xl text-xs">
                                Library empty.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {library.map((item) => (
                                    <div key={item.id} className="group bg-[#121214] border border-white/5 p-4 rounded-xl hover:border-indigo-500/50 transition-all relative">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-sm">{item.name}</h3>
                                            <button onClick={() => deleteDna(item.id)} className="text-slate-600 hover:text-red-400"><Trash2 size={14} /></button>
                                        </div>
                                        <button 
                                            onClick={() => activateDna(item.dna_profile)}
                                            className="w-full py-1.5 bg-white/5 border border-white/5 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 text-slate-300 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle size={12} /> Activate
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
          </div>
       </div>
    </div>
  )
}
