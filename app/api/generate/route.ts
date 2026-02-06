import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY
    
    // FALLBACK DATA (We prepare this in case anything goes wrong)
    const fallbackData = [
        { audio: `Here is a video about ${prompt}`, visual: "Title Card", type: "Stock Video" },
        { audio: "The AI is warming up, but this is a placeholder scene.", visual: "Loading Animation", type: "Stock Video" },
        { audio: "Try hitting the button again for a fresh script.", visual: "Robot Character", type: "Stock Video" }
    ]

    if (!apiKey) {
        return NextResponse.json({ data: fallbackData })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const aiPrompt = `
      You are a JSON generator. 
      Topic: ${prompt}
      Output: A strict JSON Array of 3 objects.
      Keys: "audio", "visual", "type".
      NO Markdown. NO code blocks.
      Example: [{"audio":"Hi","visual":"Wave","type":"Stock Video"}]
    `

    const result = await model.generateContent(aiPrompt)
    const text = result.response.text()

    // AGGRESSIVE CLEANING
    // Remove markdown, newlines, and any text before the first '['
    let cleanText = text.replace(/```json/g, '').replace(/```/g, '')
    const start = cleanText.indexOf('[')
    const end = cleanText.lastIndexOf(']') + 1

    if (start !== -1 && end > start) {
        const jsonStr = cleanText.slice(start, end)
        const parsed = JSON.parse(jsonStr)
        return NextResponse.json({ data: parsed })
    }

    // If we get here, parsing failed -> Return Fallback
    console.log("Parsing failed, returning fallback.")
    return NextResponse.json({ data: fallbackData })

  } catch (error) {
    console.error("Script Error:", error)
    // CRITICAL: Never return an error code, always return fallback data
    return NextResponse.json({ 
        data: [
            { audio: "Script generation hit a snag.", visual: "Error Glitch", type: "Stock Video" },
            { audio: "Please try again.", visual: "Retry Icon", type: "Stock Video" }
        ]
    })
  }
}