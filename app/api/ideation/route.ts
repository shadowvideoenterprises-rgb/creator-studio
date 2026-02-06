import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: Request) {
  try {
    const { topic, style } = await req.json()
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
    })

    const prompt = `
      ROLE: YouTube Viral Strategist.
      TASK: Generate 6 high-potential video concepts for the topic: "${topic}".
      STYLE: ${style || 'General'}.
      
      OUTPUT FORMAT (JSON ARRAY):
      [
        {
          "title": "Clickable Title (Under 60 chars)",
          "hook": "First 10 seconds script hook...",
          "thumbnail": "Visual description of the thumbnail",
          "score": 85 (Predict viral score 1-100 based on curiosity gap)
        }
      ]
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const ideas = JSON.parse(response.text())

    return NextResponse.json({ ideas })
    
  } catch (error) {
    return NextResponse.json({ error: 'Failed to ideate' }, { status: 500 })
  }
}