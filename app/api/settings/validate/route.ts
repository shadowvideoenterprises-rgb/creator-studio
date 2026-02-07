import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: Request) {
  try {
    const { provider, apiKey } = await req.json()

    if (!apiKey) {
      return NextResponse.json({ valid: false, error: 'No API Key provided' }, { status: 400 })
    }

    let validModels: string[] = []

    // --- 1. VALIDATE OPENAI ---
    if (provider === 'openai') {
      try {
        const openai = new OpenAI({ apiKey })
        const list = await openai.models.list()
        
        // Filter for chat models only (we don't want 'dall-e' or 'whisper' in the script dropdown)
        validModels = list.data
          .filter(m => m.id.includes('gpt'))
          .map(m => m.id)
          .sort() // Alphabetical
          
        return NextResponse.json({ valid: true, models: validModels })
      } catch (e: any) {
        return NextResponse.json({ valid: false, error: e.message })
      }
    }

    // --- 2. VALIDATE GEMINI ---
    else if (provider === 'gemini') {
      try {
        // Gemini doesn't have a simple "list models" in the node SDK that accepts just a key easily without auth setup, 
        // so we will test the key by trying to fetch the model info for a standard model.
        // Or we can use the REST API which is simpler for validation.
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        const res = await fetch(url)
        const data = await res.json()

        if (data.error) throw new Error(data.error.message)

        if (data.models) {
            validModels = data.models
                .filter((m: any) => m.name.includes('gemini'))
                .map((m: any) => m.name.replace('models/', '')) // Clean up "models/gemini-pro" -> "gemini-pro"
        } else {
            // Fallback if list fails but key is valid
            validModels = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro']
        }

        return NextResponse.json({ valid: true, models: validModels })
      } catch (e: any) {
        return NextResponse.json({ valid: false, error: e.message })
      }
    }

    // --- 3. VALIDATE ANTHROPIC (Example stub for future) ---
    else if (provider === 'claude') {
        // Mock validation for now as SDK isn't installed yet
        if (apiKey.startsWith('sk-ant')) {
             return NextResponse.json({ valid: true, models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'] })
        } else {
             return NextResponse.json({ valid: false, error: 'Invalid Anthropic Key format' })
        }
    }

    return NextResponse.json({ valid: false, error: 'Unknown Provider' }, { status: 400 })

  } catch (error: any) {
    return NextResponse.json({ valid: false, error: error.message }, { status: 500 })
  }
}
