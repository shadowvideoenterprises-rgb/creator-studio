import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY
    
    if (!apiKey) return NextResponse.json({ error: 'Missing API Key' }, { status: 500 })

    const genAI = new GoogleGenerativeAI(apiKey)
    // Use the FLASH model for speed
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

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

    // --- SMART PARSING FIX ---
    // Find the first '[' and the last ']' to extract only the JSON array.
    const start = text.indexOf('[')
    const end = text.lastIndexOf(']') + 1

    if (start === -1 || end === 0) {
        // If we can't find brackets, the AI failed to follow instructions.
        throw new Error("AI response did not contain a valid JSON array")
    }

    const cleanJson = text.slice(start, end)
    const parsedData = JSON.parse(cleanJson)
    // -------------------------

    return NextResponse.json({ data: parsedData })
    
  } catch (error: any) {
    console.error("Script Gen Error:", error)
    // Send a clear error message back to the frontend
    return NextResponse.json({ error: error.message || 'Script generation failed' }, { status: 500 })
  }
}