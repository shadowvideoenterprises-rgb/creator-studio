import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: Request) {
  try {
    const { script, title } = await req.json()
    
    // We summarize the script first to give context to the AI
    const scriptText = script.map((s: any) => s.audio).join(" ").substring(0, 5000)

    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
    })

    const prompt = `
      ROLE: YouTube Growth Expert.
      TASK: Create a Launch Package for this video.
      TITLE: "${title}"
      SCRIPT CONTEXT: "${scriptText}..."
      
      OUTPUT JSON:
      {
        "optimizedTitle": "A better, click-optimized version of the title",
        "description": "3-paragraph SEO description including keywords",
        "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
        "hashtags": ["#tag1", "#tag2", "#tag3"],
        "pinnedComment": "Engaging question to ask viewers",
        "chapters": [
             {"time": "0:00", "label": "Intro"},
             {"time": "2:30", "label": "The Turning Point"}
        ]
      }
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const data = JSON.parse(response.text())

    return NextResponse.json({ data })
    
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to generate marketing data' }, { status: 500 })
  }
}