import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: Request) {
  const { prompt } = await req.json()

  try {
    // 1. Try Google First (Fast Model)
    const apiKey = process.env.GEMINI_API_KEY
    if (apiKey) {
        try {
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
                return NextResponse.json({ url: `data:image/jpeg;base64,${images[0].encoding}`, isBase64: true })
            }
        } catch (e) {
            console.log("Google Image failed, switching to backup...")
        }
    }

    // 2. BACKUP: Pollinations (Server-Side Proxy)
    // We download the image on the server so the frontend gets a clean Base64 string
    const seed = Math.floor(Math.random() * 1000000)
    const encodedPrompt = encodeURIComponent(prompt + " cinematic, photorealistic")
    const pollUrl = `https://pollinations.ai/p/${encodedPrompt}?width=1280&height=720&seed=${seed}&model=flux`

    const imageRes = await fetch(pollUrl)
    const imageBuffer = await imageRes.arrayBuffer()
    const base64 = Buffer.from(imageBuffer).toString('base64')

    return NextResponse.json({ 
        url: `data:image/jpeg;base64,${base64}`, 
        isBase64: true 
    })

  } catch (error: any) {
    console.error('Image Gen Error:', error)
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 })
  }
}