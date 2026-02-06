import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: Request) {
  const { prompt } = await req.json()

  // 1. TRY GOOGLE FIRST (The "Nano/Fast" Model)
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error("No API Key")

    const genAI = new GoogleGenerativeAI(apiKey)
    
    // We try the "Fast" model (likely what you meant by Nano)
    const model = genAI.getGenerativeModel({ model: "imagen-3.0-fast-generate-001" })

    console.log("Attempting Google Image Gen...")
    
    // @ts-ignore (Ignore typescript warning for new features)
    const result = await model.generateImages({
      prompt: `Cinematic, photorealistic, 4k: ${prompt}`,
      numberOfImages: 1,
      aspectRatio: "16:9",
      outputMimeType: "image/jpeg",
    })

    const response = result.response
    const images = response.images

    if (!images || images.length === 0) throw new Error("Google returned no images")

    const base64Image = `data:image/jpeg;base64,${images[0].encoding}`
    return NextResponse.json({ url: base64Image, isBase64: true })

  } catch (googleError: any) {
    
    // 2. FALLBACK TO POLLINATIONS (If Google fails/404s)
    console.warn("Google failed, switching to backup:", googleError.message)

    const seed = Math.floor(Math.random() * 1000000)
    const encodedPrompt = encodeURIComponent(prompt + " cinematic, photorealistic, 4k")
    const imageUrl = `https://pollinations.ai/p/${encodedPrompt}?width=1280&height=720&seed=${seed}&model=flux`

    return NextResponse.json({ url: imageUrl, isBase64: false })
  }
}