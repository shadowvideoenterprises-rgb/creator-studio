import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { CreditService } from '@/lib/services/creditService'

export async function POST(req: Request) {
  try {
    const { topic, userId } = await req.json()
    if (!topic) return NextResponse.json({ error: 'Topic required' }, { status: 400 })

    // 1. Payment Check (Low cost: 1 Credit)
    const canPay = await CreditService.charge(userId, 1, `Concept Gen: ${topic}`)
    if (!canPay) return NextResponse.json({ error: "Insufficient Credits" }, { status: 402 })

    // 2. Get API Key
    const { data: settings } = await supabaseAdmin.from('user_settings').select('api_keys').eq('user_id', userId).single()
    const apiKey = settings?.api_keys?.google;
    
    if (!apiKey) return NextResponse.json({ error: "No Google Key" }, { status: 400 })

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash',
        generationConfig: { responseMimeType: "application/json" } 
    })

    const PROMPT = `
    You are a YouTube Strategist. Generate 5 viral video concepts for the topic: "${topic}".
    
    Analyze each concept for:
    - Curiosity Gap
    - Emotional Hook
    - Broad Appeal
    
    Return JSON:
    {
      "concepts": [
        {
          "title": "Viral Title Here",
          "hook": "Why this works...",
          "score": <Number 1-10 representing viral potential>
        }
      ]
    }
    `

    const result = await model.generateContent(PROMPT)
    const concepts = JSON.parse(result.response.text()).concepts || []

    return NextResponse.json({ success: true, concepts })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
