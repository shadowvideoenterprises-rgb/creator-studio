import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY
    
    if (!apiKey) {
        return NextResponse.json({ error: 'Missing Gemini API Key' }, { status: 500 })
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey)
    
    // Use the Imagen model (Standard for Gemini users)
    const model = genAI.getGenerativeModel({ model: "imagen-3.0-generate-001" })

    // Generate the image
    const result = await model.generateImages({
      prompt: `Cinematic, photorealistic, high quality, 8k: ${prompt}`,
      numberOfImages: 1,
      aspectRatio: "16:9", 
      outputMimeType: "image/jpeg",
    })

    const response = result.response
    const images = response.images
    
    if (!images || images.length === 0) {
        throw new Error("No image returned")
    }

    // Convert the raw data to a Base64 string that the browser can display
    const base64Image = `data:image/jpeg;base64,${images[0].encoding}`

    return NextResponse.json({ url: base64Image, isBase64: true })
    
  } catch (error: any) {
    console.error('Gemini Image Error:', error)
    return NextResponse.json({ error: error.message || 'Generation failed' }, { status: 500 })
  }
}