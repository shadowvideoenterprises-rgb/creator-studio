import { NextResponse } from 'next/server'
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai' // <--- NEW IMPORT

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY

    // Fallback data in case the key is missing
    const fallbackData = [
        { audio: `Here is a script about ${prompt}`, visual: "Title Card", type: "Stock Video" },
        { audio: "The AI is retrying...", visual: "Loading", type: "Stock Video" }
    ]

    if (!apiKey) return NextResponse.json({ data: fallbackData })

    const genAI = new GoogleGenerativeAI(apiKey)
    
    // We Configure the model to speak strictly in JSON
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
            responseMimeType: "application/json", // <--- THE KEY FIX
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
    
    // No regex cleaning needed anymore!
    const parsedData = JSON.parse(result.response.text())
    
    return NextResponse.json({ data: parsedData })

  } catch (error) {
    console.error("Script Gen Error:", error)
    return NextResponse.json({ 
        data: [
            { audio: "Script generation failed.", visual: "Error Glitch", type: "Stock Video" },
            { audio: "Please try again.", visual: "Retry Icon", type: "Stock Video" }
        ]
    })
  }
}