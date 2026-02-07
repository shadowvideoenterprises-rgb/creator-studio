import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { CreditService } from '@/lib/services/creditService'

export async function POST(req: Request) {
  try {
    const { projectId, title, model, tone = 'Engaging' } = await req.json()

    // 1. Get Project Owner
    const { data: project } = await supabaseAdmin.from('projects').select('user_id').eq('id', projectId).single()
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    // 2. PAYMENT CHECK (Cost: 10)
    const canPay = await CreditService.charge(project.user_id, 10, `Script Gen: ${title.substring(0, 20)}...`)
    if (!canPay) return NextResponse.json({ error: "Insufficient Credits. Need 10." }, { status: 402 })

    // 3. Fetch Settings & Research
    const { data: settings } = await supabaseAdmin.from('user_settings').select('*').eq('user_id', project.user_id).single()
    const keys = settings?.api_keys || {}
    const { data: knowledge } = await supabaseAdmin.from('project_knowledge').select('content').eq('project_id', projectId)
    const context = knowledge?.map(k => k.content).join('\n') || "No specific research."

    // 4. Generate
    const genAI = new GoogleGenerativeAI(keys.google)
    const targetModel = model || 'gemini-2.0-flash'
    const aiModel = genAI.getGenerativeModel({ 
        model: targetModel,
        generationConfig: { responseMimeType: "application/json" } 
    })

    const PROMPT = `
    You are an expert YouTuber. Write a script for: "${title}".
    Tone: ${tone}
    Context: ${context}
    OUTPUT RULES:
    1. Create 5-8 scenes.
    2. "visual_description": Detailed prompt for image generation.
    3. "audio_text": Conversational voiceover.
    4. TIMING: 150 wpm. Keep each scene under 10 seconds.
    Return JSON: { "scenes": [ { "visual_description": "...", "audio_text": "..." } ] }
    `

    const result = await aiModel.generateContent(PROMPT)
    let scenes = JSON.parse(result.response.text()).scenes || []

    // 5. Apply Physics & Save
    scenes = scenes.map((s: any, i: number) => {
        const duration = Math.ceil(s.audio_text.split(' ').length / 2.5)
        return { ...s, project_id: projectId, sequence_order: i + 1, estimated_duration: duration }
    })

    await supabaseAdmin.from('scenes').delete().eq('project_id', projectId)
    await supabaseAdmin.from('scenes').insert(scenes)

    return NextResponse.json({ success: true, count: scenes.length })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
