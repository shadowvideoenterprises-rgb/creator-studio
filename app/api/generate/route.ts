import { NextResponse } from 'next/server'
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY

    // Fallback if key is missing or fails
    const fallbackData = [
        { audio: `Here is a script about ${prompt}`, visual: "Title Card", type: "Stock Video" },
        { audio: "The AI is retrying, please wait.", visual: "Loading", type: "Stock Video" }
    ]

    if (!apiKey) return NextResponse.json({ data: fallbackData })

    const genAI = new GoogleGenerativeAI(apiKey)
    // Use Flash model for speed
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
            responseMimeType: "application/json", // <--- THE MAGIC FIX
            responseSchema: {
                type: SchemaType.ARRAY,
                items: {
                    type: SchemaType.OBJECT,
                    properties: {
                        audio: { type: SchemaType.STRING },
                        visual: { type: SchemaType.STRING },
                        type: { type: SchemaType.STRING }
                    },
                    required: ["audio", "visual", "type"]
                }
            }
        }
    })

    const result = await model.generateContent(`Create 3 video scenes about: ${prompt}`)
    
    // Since we forced JSON, we can parse it directly without cleanup
    const parsedData = JSON.parse(result.response.text())
    
    return NextResponse.json({ data: parsedData })

  } catch (error) {
    console.error("Script Gen Error:", error)
    return NextResponse.json({ 
        data: [
            { audio: "We hit a snag generating the script.", visual: "Glitch Background", type: "Stock Video" },
            { audio: "Please try clicking 'Generate' again.", visual: "Retry Icon", type: "Stock Video" }
        ]
    })
  }
}