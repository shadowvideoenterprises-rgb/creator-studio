import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'
import { supabaseAdmin } from '@/lib/supabaseServer'

export async function POST(req: Request) {
  try {
    const { projectId, description, model = 'gemini-3-pro-preview' } = await req.json()

    if (!projectId) return NextResponse.json({ error: 'No Project ID' }, { status: 400 })

    // 1. Get Project & Keys
    const { data: project } = await supabaseAdmin.from('projects').select('user_id').eq('id', projectId).single()
    
    if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const { data: settings } = await supabaseAdmin.from('user_settings').select('api_keys').eq('user_id', project.user_id).single()
    const keys = settings?.api_keys || {}

    // 2. The "Architect" Prompt
    const SYSTEM_PROMPT = `
    You are a YouTube Viral Architect.
    Context: "${description}"

    Your Goal: Break this video idea into a structured 5-part synopsis.
    
    STRUCTURE REQUIRED:
    1. The Hook (0-60s): The burning question or conflict.
    2. Context/Backstory: What the audience needs to know.
    3. The Escalation: 3 specific data points or twists (The "Meat").
    4. The Climax: The most shocking revelation.
    5. The Takeaway: The philosophical or practical conclusion.

    OUTPUT FORMAT (JSON Only):
    {
      "titles": ["Clickbait Title 1", "Search-Optimized Title 2", "Story Title 3"],
      "thumbnails": ["Visual description of a high-CTR thumbnail..."],
      "outline": [
        { "point": "The Hook", "description": "Start with the specific moment Rome died...", "research_needed": false },
        { "point": "The Urine Tax", "description": "Explain Vespasian's tax on public urinals.", "research_needed": true }
      ]
    }
    `

    // FIX: Type as 'any' to prevent "Property does not exist" errors
    let resultData: any = {}

    // --- GEMINI 3 EXECUTION ---
    if (model.includes('gemini') || model.includes('banana')) {
        if (!keys.google) throw new Error("No Google Key found")
        const genAI = new GoogleGenerativeAI(keys.google)
        const modelId = model.startsWith('models/') ? model : `models/${model}`
        
        const aiModel = genAI.getGenerativeModel({ 
            model: modelId,
            generationConfig: { responseMimeType: "application/json" } 
        })

        const result = await aiModel.generateContent(SYSTEM_PROMPT)
        resultData = JSON.parse(result.response.text())
    } 
    // --- OPENAI EXECUTION ---
    else if (model.includes('gpt')) {
        const openai = new OpenAI({ apiKey: keys.openai })
        const completion = await openai.chat.completions.create({
            model: model,
            messages: [{ role: "system", content: "You are a JSON architect." }, { role: "user", content: SYSTEM_PROMPT }],
            response_format: { type: "json_object" }
        })
        resultData = JSON.parse(completion.choices[0].message.content || "{}")
    }

    // 3. Save to Database
    const { error } = await supabaseAdmin
        .from('projects')
        .update({
            title_candidates: resultData.titles || [],
            thumbnail_concepts: resultData.thumbnails || [],
            outline: resultData.outline || []
        })
        .eq('id', projectId)

    if (error) throw error

    return NextResponse.json({ success: true, data: resultData })

  } catch (error: any) {
    console.error("Outline Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
