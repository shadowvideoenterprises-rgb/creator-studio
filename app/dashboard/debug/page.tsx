'use client'
import { useState } from 'react'

export default function DebugPage() {
  const [provider, setProvider] = useState('google')
  const [key, setKey] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runTest = async () => {
    setLoading(true)
    setResult(null)
    try {
        const res = await fetch('/api/settings/verify-key', {
            method: 'POST',
            body: JSON.stringify({ provider, apiKey: key })
        })
        const data = await res.json()
        setResult(data)
    } catch (e: any) {
        setResult({ error: e.message })
    }
    setLoading(false)
  }

  return (
    <div className="p-10 bg-black min-h-screen text-white font-mono">
        <h1 className="text-2xl font-bold mb-6 text-red-500">🔧 Engine Diagnostic Tool</h1>
        
        <div className="space-y-4 max-w-xl">
            <div className="flex gap-4">
                <select value={provider} onChange={e => setProvider(e.target.value)} className="bg-gray-800 p-2 rounded text-white border border-gray-700">
                    <option value="google">Google Gemini</option>
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                </select>
                <input 
                    value={key} 
                    onChange={e => setKey(e.target.value)} 
                    placeholder="Paste API Key here..." 
                    className="flex-1 bg-gray-800 p-2 rounded text-white border border-gray-700 focus:border-red-500 outline-none"
                />
            </div>
            
            <button onClick={runTest} disabled={loading || !key} className="w-full py-3 bg-red-600 hover:bg-red-500 rounded font-bold disabled:opacity-50 transition-all">
                {loading ? 'Running Diagnostic...' : 'Test Key & List Models'}
            </button>
        </div>

        {result && (
            <div className="mt-8 p-6 bg-gray-900 rounded-xl border border-gray-700 overflow-auto max-h-[600px] shadow-2xl">
                <h3 className={`font-bold mb-4 ${result.valid ? 'text-green-400' : 'text-red-400'}`}>
                    {result.valid ? '✅ Connection Successful' : '❌ Connection Failed'}
                </h3>
                
                {result.error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-sm mb-4">
                        <strong>Error:</strong> {result.error}
                    </div>
                )}

                {result.models && (
                    <div>
                        <p className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-2">Available Models ({result.models.length})</p>
                        <div className="grid gap-2">
                            {result.models.map((m: any) => (
                                <div key={m.id} className="flex justify-between p-2 bg-black/40 rounded border border-white/5 text-xs">
                                    <span className="text-blue-300 font-bold">{m.id}</span>
                                    <span className="text-slate-500">{m.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-6 pt-4 border-t border-white/10">
                    <p className="text-slate-500 text-xs mb-2">Raw Response:</p>
                    <pre className="text-[10px] text-slate-600 overflow-x-auto">{JSON.stringify(result, null, 2)}</pre>
                </div>
            </div>
        )}
    </div>
  )
}
