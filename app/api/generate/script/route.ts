import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'
import { supabaseAdmin } from '@/lib/supabaseServer'

export async function POST(req: Request) {
  try {
    const { projectId, title, model, tone = 'Engaging' } = await req.json()

    if (!projectId) return NextResponse.json({ error: 'No Project ID' }, { status: 400 })

    // 1. Get Project & Keys
    const { data: project } = await supabaseAdmin.from('projects').select('*').eq('id', projectId).single()
    const { data: settings } = await supabaseAdmin.from('user_settings').select('api_keys').eq('user_id', project.user_id).single()
    const keys = settings?.api_keys || {}

    // 2. FETCH KNOWLEDGE (New Step)
    // We grab the user's research notes to ground the script in facts
    const { data: knowledgeData } = await supabaseAdmin
        .from('project_knowledge')
        .select('content')
        .eq('project_id', projectId)
    
    const researchContext = knowledgeData?.map(k => `- ${k.content}`).join('\n') || "No specific research provided."

    // 3. Construct the "Director's Prompt"
    const SYSTEM_PROMPT = `
    You are an expert YouTube Scriptwriter.
    Title: "${title}"
    Tone: "${tone}" (Strictly adhere to this style)
    
    CORE CONCEPT:
    ${project.description}

    RESEARCH / KEY FACTS TO INCLUDE:
    ${researchContext}

    RULES:
    1. Divide the script into SCENES.
    2. Scene 1 (Hook) must be under 10 seconds and grab attention immediately.
    3. Use the provided Research facts to make the script unique.
    4. Provide VISUAL descriptions for an AI image generator (detailed, atmospheric).
    5. Provide AUDIO text for the voiceover (conversational, spoken-word style).
    
    OUTPUT FORMAT (Raw JSON only):
    {
      "scenes": [
        { 
          "visual_description": "Cinematic shot of...", 
          "audio_text": "Did you know that in Ancient Rome..." 
        }
      ]
    }
    `

    let scenes = []

    // --- GOOGLE GEMINI ---
    if (model.includes('gemini') || model.includes('banana')) {
        if (!keys.google) throw new Error("No Google Key found")
        const genAI = new GoogleGenerativeAI(keys.google)
        const modelId = model.startsWith('models/') ? model : `models/${model}`
        
        const aiModel = genAI.getGenerativeModel({ 
            model: modelId,
            generationConfig: { responseMimeType: "application/json" } 
        })

        const result = await aiModel.generateContent(SYSTEM_PROMPT)
        const text = result.response.text()
        scenes = JSON.parse(text).scenes || []
    } 
    
    // --- OPENAI ---
    else if (model.includes('gpt')) {
        if (!keys.openai) throw new Error("No OpenAI Key found")
        const openai = new OpenAI({ apiKey: keys.openai })
        
        const completion = await openai.chat.completions.create({
            model: model,
            messages: [
                { role: "system", content: "You are a JSON script generator." },
                { role: "user", content: SYSTEM_PROMPT }
            ],
            response_format: { type: "json_object" }
        })
        
        scenes = JSON.parse(completion.choices[0].message.content || "{}").scenes || []
    }

    // 4. Save to DB
    if (scenes.length > 0) {
        await supabaseAdmin.from('scenes').delete().eq('project_id', projectId)
        const rows = scenes.map((s: any, index: number) => ({
            project_id: projectId,
            sequence_order: index + 1,
            visual_description: s.visual_description,
            audio_text: s.audio_text
        }))
        await supabaseAdmin.from('scenes').insert(rows)
    }

    return NextResponse.json({ success: true, count: scenes.length })

  } catch (error: any) {
    console.error("Script Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
