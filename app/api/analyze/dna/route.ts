import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { CreditService } from '@/lib/services/creditService'
import { JsonValidator } from '@/lib/utils/jsonValidator'

export async function POST(req: Request) {
  try {
    const { channelName, userId } = await req.json()
    if (!channelName) return NextResponse.json({ error: 'Channel Name required' }, { status: 400 })

    // 1. Payment (Analysis costs 2 credits)
    const canPay = await CreditService.charge(userId, 2, `DNA Analysis: ${channelName}`)
    if (!canPay) return NextResponse.json({ error: "Insufficient Credits" }, { status: 402 })

    // 2. Get API Key
    const { data: settings } = await supabaseAdmin.from('user_settings').select('api_keys').eq('user_id', userId).single()
    const apiKey = settings?.api_keys?.google;
    
    if (!apiKey) return NextResponse.json({ error: "No Google Key" }, { status: 400 })

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const PROMPT = `
    You are a YouTube Expert. Analyze the successful YouTube channel: "${channelName}".
    Reverse-engineer their content strategy into a "Channel DNA" profile.
    
    Return STRICT JSON ONLY:
    {
      "audience": "Specific demographics & psychographics (e.g. Gen Z males interested in engineering)",
      "tone": "The emotional vibe (e.g. Sarcastic, Hyper-Energetic, Calm Authority)",
      "style": "Visuals & Editing (e.g. Fast cuts, 3D Animation, Handheld Vlog)",
      "pacing": "Speed of content (e.g. Hyper-Paced, Moderate, Slow & Deliberate)"
    }
    `

    const result = await model.generateContent(PROMPT)
    const text = result.response.text()
    const dna = JsonValidator.parse(text, null);

    if (!dna || !dna.audience) throw new Error("Failed to analyze channel.");

    return NextResponse.json({ success: true, dna })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
