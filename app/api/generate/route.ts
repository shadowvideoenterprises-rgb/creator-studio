import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY
    
    if (!apiKey) return NextResponse.json({ error: 'Missing API Key' }, { status: 500 })

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // We construct the prompt as a simple string to avoid syntax errors
    const aiPrompt = `
      You are a video script generator. Output ONLY valid JSON.
      Topic: ${prompt}
      
      Format: An array of 3 scene objects.
      Example:
      [
        { "audio": "Hook sentence...", "visual": "Description...", "type": "Stock Video" },
        { "audio": "Middle sentence...", "visual": "Description...", "type": "Stock Video" },
        { "audio": "Ending sentence...", "visual": "Description...", "type": "Stock Video" }
      ]
      
      Do not include "json" or markdown formatting. Just the raw array.
    `

    const result = await model.generateContent(aiPrompt)
    const text = result.response.text()
    
    console.log("Raw AI Response:", text) 

    // SMART PARSING: Find the Array manually to ignore "Here is your JSON" text
    const start = text.indexOf('[')
    const end = text.lastIndexOf(']') + 1

    if (start === -1 || end === 0) {
        throw new Error("AI response did not contain a valid JSON array")
    }

    const cleanJson = text.slice(start, end)
    const parsedData = JSON.parse(cleanJson)

    return NextResponse.json({ data: parsedData })
    
  } catch (error: any) {
    console.error("Script Gen Error:", error)
    return NextResponse.json({ error: error.message || 'Script generation failed' }, { status: 500 })
  }
}