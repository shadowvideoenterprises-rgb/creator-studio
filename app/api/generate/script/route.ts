import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabaseAdmin } from '@/lib/supabaseServer'

export async function POST(req: Request) {
  try {
    const { projectId, title, model, tone = 'Engaging' } = await req.json()

    // 1. Setup
    const { data: project } = await supabaseAdmin.from('projects').select('*').eq('id', projectId).single()
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    const { data: settings } = await supabaseAdmin.from('user_settings').select('*').eq('user_id', project.user_id).single()
    const keys = settings?.api_keys || {}
    
    // 2. Fetch Research (Context)
    const { data: knowledge } = await supabaseAdmin.from('project_knowledge').select('content').eq('project_id', projectId)
    const context = knowledge?.map(k => k.content).join('\n') || "No specific research."

    // 3. Generate
    const genAI = new GoogleGenerativeAI(keys.google)
    // Use the model passed from UI, or fallback to the one in settings, or default
    const targetModel = model || 'gemini-2.0-flash'
    
    const aiModel = genAI.getGenerativeModel({ 
        model: targetModel,
        generationConfig: { responseMimeType: "application/json" } 
    })

    const PROMPT = `
    You are an expert YouTuber. Write a script for: "${title}".
    Tone: ${tone}
    Context/Research: ${context}

    OUTPUT RULES:
    1. Create 5-8 scenes.
    2. "visual_description": Detailed prompt for image generation.
    3. "audio_text": The voiceover. MUST BE CONVERSATIONAL.
    4. TIMING: 150 words per minute. Keep each scene under 10 seconds (~25 words).
    
    Return JSON: { "scenes": [ { "visual_description": "...", "audio_text": "..." } ] }
    `

    const result = await aiModel.generateContent(PROMPT)
    let scenes = JSON.parse(result.response.text()).scenes || []

    // 4. APPLY PHYSICS (Duration Calculation)
    scenes = scenes.map((s: any, i: number) => {
        const wordCount = s.audio_text.split(' ').length
        // 150 wpm = 2.5 words per second
        const duration = Math.ceil(wordCount / 2.5)
        return {
            ...s,
            project_id: projectId,
            sequence_order: i + 1,
            estimated_duration: duration
        }
    })

    // 5. Save
    await supabaseAdmin.from('scenes').delete().eq('project_id', projectId)
    await supabaseAdmin.from('scenes').insert(scenes)

    return NextResponse.json({ success: true, count: scenes.length })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
