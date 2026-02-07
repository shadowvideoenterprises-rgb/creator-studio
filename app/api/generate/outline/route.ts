import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { QualityScorer } from '@/lib/services/qualityScorer'

export async function POST(req: Request) {
  try {
    const { projectId, description, duration = 'Medium (5-8 min)', model = 'gemini-2.0-flash' } = await req.json()

    if (!projectId) return NextResponse.json({ error: 'No Project ID' }, { status: 400 })

    // 1. Get Project
    const { data: project } = await supabaseAdmin.from('projects').select('user_id').eq('id', projectId).single()
    
    // Safety Check
    if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // 2. Get Settings
    const { data: settings } = await supabaseAdmin.from('user_settings').select('api_keys').eq('user_id', project.user_id).single()
    const keys = settings?.api_keys || {}

    if (!keys.google) throw new Error("No Google Key found")

    // 3. GENERATE RAW CONCEPTS
    const genAI = new GoogleGenerativeAI(keys.google)
    const aiModel = genAI.getGenerativeModel({ 
        model: model,
        generationConfig: { responseMimeType: "application/json" } 
    })

    const SYSTEM_PROMPT = `
    You are a YouTube Viral Architect.
    Context: "${description}"
    Target Length: "${duration}"

    OUTPUT FORMAT (JSON Only):
    {
      "titles": ["Title 1", "Title 2", "Title 3", "Title 4", "Title 5"],
      "thumbnails": ["Thumb 1", "Thumb 2", "Thumb 3"],
      "outline": [
        { "point": "The Hook", "description": "...", "research_needed": false },
        { "point": "The Turn", "description": "...", "research_needed": true }
      ]
    }
    `

    const result = await aiModel.generateContent(SYSTEM_PROMPT)
    const resultData = JSON.parse(result.response.text())

    // 4. APPLY QUALITY SCORING
    // FIX: Added ': any[]' to satisfy TypeScript strict mode
    let scoredTitles: any[] = [] 
    
    if (resultData.titles && resultData.titles.length > 0) {
        console.log("Scoring titles...")
        const scorer = new QualityScorer(keys.google)
        scoredTitles = await scorer.batchScore(resultData.titles, description)
    }

    // 5. Save to Database
    const { error } = await supabaseAdmin
        .from('projects')
        .update({
            target_duration: duration,
            title_candidates: scoredTitles.length > 0 ? scoredTitles : resultData.titles,
            thumbnail_concepts: resultData.thumbnails || [],
            outline: resultData.outline || []
        })
        .eq('id', projectId)

    if (error) throw error

    return NextResponse.json({ 
        success: true, 
        data: { 
            ...resultData, 
            titles: scoredTitles 
        } 
    })

  } catch (error: any) {
    console.error("Outline Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
