import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: Request) {
  const { prompt } = await req.json()

  // 1. TRY GOOGLE FAST MODEL (If you have access)
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (apiKey) {
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: "imagen-3.0-fast-generate-001" })
        
        // @ts-ignore
        const result = await model.generateImages({
          prompt: `Cinematic, photorealistic, 4k: ${prompt}`,
          numberOfImages: 1,
          aspectRatio: "16:9",
          outputMimeType: "image/jpeg",
        })
        const images = result.response.images
        if (images && images.length > 0) {
            // Google Success
            return NextResponse.json({ url: `data:image/jpeg;base64,${images[0].encoding}`, isBase64: true })
        }
    }
  } catch (e) {
    console.log("Google Image Gen skipped (likely no access), using backup.")
  }

  // 2. RELIABLE BACKUP: Pollinations Direct Link
  // We send the URL directly. Browsers handle this much better than the server proxy.
  const seed = Math.floor(Math.random() * 1000000)
  const encodedPrompt = encodeURIComponent(prompt + " cinematic, photorealistic")
  const imageUrl = `https://pollinations.ai/p/${encodedPrompt}?width=1280&height=720&seed=${seed}&model=flux&nocache=${seed}`

  return NextResponse.json({ url: imageUrl, isBase64: false })
}