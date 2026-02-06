import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY
    
    if (!apiKey) return NextResponse.json({ error: 'Missing API Key' }, { status: 500 })

    const genAI = new GoogleGenerativeAI(apiKey)
    // Use the FLASH model (It is 10x faster and prevents Vercel timeouts)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const result = await model.generateContent(`
      You are a video script writer. Create a strictly valid JSON response.
      Topic: ${prompt}
      
      Output Format: An array of 3 objects:
      [
        { "audio": "Voiceover text...", "visual": "Image description...", "type": "Stock Video" }
      ]
      
      Keep it short. Maximum 3 scenes.
    `)

    const responseText = result.response.text()
    // Clean up the response to ensure it's valid JSON
    const cleanText = responseText.replace(/```json|```/g, '').trim()
    
    return NextResponse.json({ data: JSON.parse(cleanText) })
    
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}