import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from "@google/generative-ai"
import { supabase } from '@/lib/supabaseClient'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: Request) {
  try {
    const { projectId } = await req.json()

    // 1. Fetch the Script Scenes
    const { data: scenes } = await supabase
      .from('scenes')
      .select('audio_text')
      .eq('project_id', projectId)
      .order('sequence_order', { ascending: true })

    if (!scenes || scenes.length === 0) {
      return NextResponse.json({ error: 'No script found for this project.' }, { status: 400 })
    }

    const fullScript = scenes.map(s => s.audio_text).join('\n')

    // 2. Prompt Gemini for Viral SEO
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    const prompt = `
      You are an expert YouTube SEO strategist. Based on this script, generate:
      1. Five (5) viral, click-worthy titles.
      2. A 3-paragraph SEO description including a summary, "Watch Next" section, and credits.
      3. 15 relevant tags.
      
      Script: ${fullScript}
      
      Return ONLY a JSON object with fields: "titles" (array), "description" (string), "tags" (array).
    `

    const result = await model.generateContent(prompt)
    const metadata = JSON.parse(result.response.text().replace(/```json|```/g, "").trim())

    // 3. Save to marketing_packages table
    const { data: pkg, error } = await supabase
      .from('marketing_packages')
      .upsert({
        project_id: projectId,
        optimized_title: metadata.titles[0],
        description: metadata.description,
        tags: metadata.tags
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ ...metadata, packageId: pkg.id })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}