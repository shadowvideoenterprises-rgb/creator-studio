import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabaseAdmin } from '@/lib/supabaseServer'

export async function POST(req: Request) {
  try {
    const { projectId, title, model } = await req.json() // 'model' might be passed from UI, or we auto-select

    // 1. Get Project & User Settings
    const { data: project } = await supabaseAdmin.from('projects').select('*').eq('id', projectId).single()
    const { data: settings } = await supabaseAdmin.from('user_settings').select('*').eq('user_id', project.user_id).single()
    
    const keys = settings?.api_keys || {}
    const availableModels = settings?.available_models?.google || []

    // 2. SMART MODEL SELECTION
    // If the UI didn't enforce a model, or if the enforced model isn't in our discovered list,
    // we pick the "best" available text model automatically.
    let targetModelId = model
    
    // Check if the requested model actually exists in our discovery cache
    const modelExists = availableModels.find((m: any) => m.id === model || m.name === model)

    if (!modelExists) {
        console.warn(`Requested model ${model} not found in discovery. Auto-selecting best option...`)
        // Filter for text models and sort by capability (simple heuristic: 'pro' > 'flash')
        const bestModel = availableModels
            .filter((m: any) => m.type === 'text')
            .sort((a: any, b: any) => b.id.length - a.id.length)[0] // Rudimentary sort, can be improved

        targetModelId = bestModel ? bestModel.id : 'gemini-2.0-flash' // Fallback to safe default
    }

    console.log(`Generating script using: ${targetModelId}`)

    // 3. Generate (Standard Logic)
    const genAI = new GoogleGenerativeAI(keys.google)
    const aiModel = genAI.getGenerativeModel({ 
        model: targetModelId,
        generationConfig: { responseMimeType: "application/json" } 
    })

    const prompt = `
      You are a YouTube Scriptwriter.
      Title: "${title}"
      Context: "${project.description}"
      
      Output a JSON object with a "scenes" array. 
      Each scene needs: "visual_description", "audio_text".
      Keep audio under 20 words per scene.
    `

    const result = await aiModel.generateContent(prompt)
    const responseText = result.response.text()
    const scenes = JSON.parse(responseText).scenes || []

    // 4. Save
    await supabaseAdmin.from('scenes').delete().eq('project_id', projectId)
    const rows = scenes.map((s: any, index: number) => ({
        project_id: projectId,
        sequence_order: index + 1,
        visual_description: s.visual_description,
        audio_text: s.audio_text
    }))
    await supabaseAdmin.from('scenes').insert(rows)

    return NextResponse.json({ success: true, count: scenes.length, modelUsed: targetModelId })

  } catch (error: any) {
    console.error("Script Gen Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
