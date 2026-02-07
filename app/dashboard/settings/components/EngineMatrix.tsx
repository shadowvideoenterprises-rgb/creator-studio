'use client'
import { Brain, BookOpen, PenTool, Image as ImageIcon, Mic } from 'lucide-react'
import { getModelLabel, isModelValid, sortModelsSmart } from '@/lib/model-utils'

interface EngineMatrixProps {
  settings: any
  onUpdate: (key: string, value: string) => void
  validatedModels: Record<string, any[]>
}

export function EngineMatrix({ settings, onUpdate, validatedModels }: EngineMatrixProps) {
  
  const buildOptions = (category: 'text' | 'image' | 'audio') => {
     let options: any[] = []
     
     Object.entries(validatedModels).forEach(([provider, models]) => {
         models.forEach((m: any) => {
             if (isModelValid(m.id, category)) {
                 options.push({ 
                    value: m.id, 
                    label: getModelLabel(m.id, provider, m.name) 
                 })
             }
         })
     })
     
     options = sortModelsSmart(options)
     options.unshift({ value: '', label: 'Select a Model...' })
     return options
  }

  const scriptOptions = buildOptions('text')
  const imageOptions = buildOptions('image')
  const audioOptions = buildOptions('audio')

  return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="grid lg:grid-cols-3 gap-6">
              {/* IDEATION */}
              <div className="bg-[#121214] border border-white/5 p-6 rounded-3xl group hover:border-blue-500/30 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Brain size={20} /></div>
                      <h3 className="text-lg font-bold text-white">1. Ideation</h3>
                  </div>
                  <select 
                    value={settings.ideation_model || ''} 
                    onChange={(e) => onUpdate('ideation_model', e.target.value)} 
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:border-blue-500/50 outline-none"
                  >
                     {scriptOptions.map((m: any) => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
              </div>

              {/* RESEARCH */}
              <div className="bg-[#121214] border border-white/5 p-6 rounded-3xl group hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><BookOpen size={20} /></div>
                      <h3 className="text-lg font-bold text-white">2. Research</h3>
                  </div>
                  <select 
                    value={settings.research_model || ''} 
                    onChange={(e) => onUpdate('research_model', e.target.value)} 
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:border-emerald-500/50 outline-none"
                  >
                     {scriptOptions.map((m: any) => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
              </div>

              {/* WRITING */}
              <div className="bg-[#121214] border border-white/5 p-6 rounded-3xl group hover:border-purple-500/30 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><PenTool size={20} /></div>
                      <h3 className="text-lg font-bold text-white">3. Writing</h3>
                  </div>
                  <select 
                    value={settings.writing_model || ''} 
                    onChange={(e) => onUpdate('writing_model', e.target.value)} 
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:border-purple-500/50 outline-none"
                  >
                     {scriptOptions.map((m: any) => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
              </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-[#121214] border border-white/5 p-6 rounded-3xl group hover:border-pink-500/30 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-pink-500/10 rounded-lg text-pink-400"><ImageIcon size={20} /></div>
                      <h3 className="text-lg font-bold text-white">Visual Engine</h3>
                  </div>
                  <select 
                    value={settings.default_image_model || ''} 
                    onChange={(e) => onUpdate('default_image_model', e.target.value)} 
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:border-pink-500/50 outline-none"
                  >
                     {imageOptions.map((m: any) => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
              </div>

              <div className="bg-[#121214] border border-white/5 p-6 rounded-3xl group hover:border-orange-500/30 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400"><Mic size={20} /></div>
                      <h3 className="text-lg font-bold text-white">Voice Engine</h3>
                  </div>
                  <select 
                    value={settings.default_voice_provider || ''} 
                    onChange={(e) => onUpdate('default_voice_provider', e.target.value)} 
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:border-orange-500/50 outline-none"
                  >
                     {audioOptions.map((m: any) => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
              </div>
          </div>
      </div>
  )
}
