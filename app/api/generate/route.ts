import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY
    
    if (!apiKey) return NextResponse.json({ error: 'Missing API Key' }, { status: 500 })

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const aiPrompt = `
      You are a video script generator. Output ONLY valid JSON.
      Topic: ${prompt}
      Format: Array of 3 scene objects.
      Example: [{"audio": "Text", "visual": "Desc", "type": "Stock Video"}]
      NO MARKDOWN. NO \`\`\`.
    `

    const result = await model.generateContent(aiPrompt)
    const text = result.response.text()
    console.log("AI Response:", text) // Check Vercel logs if this fails

    // Attempt to parse
    try {
        const start = text.indexOf('[')
        const end = text.lastIndexOf(']') + 1
        if (start === -1 || end === 0) throw new Error("No JSON found")
        
        const cleanJson = text.slice(start, end)
        return NextResponse.json({ data: JSON.parse(cleanJson) })

    } catch (parseError) {
        console.error("JSON Parse Failed. Using backup.", parseError)
        
        // SAFETY NET: Return a backup script instead of crashing
        return NextResponse.json({ 
            data: [
                { audio: "The AI had a hiccup, but here is your scene.", visual: "Glitch art effect", type: "Stock Video" },
                { audio: "We are generating a backup script for " + prompt, visual: "Loading screen", type: "Stock Video" },
                { audio: "Try hitting 'Retry' for a better result.", visual: "Robot smiling", type: "Stock Video" }
            ] 
        })
    }
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}