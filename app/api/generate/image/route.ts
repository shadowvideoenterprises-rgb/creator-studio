import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) return NextResponse.json({ error: 'Missing Gemini API Key' }, { status: 500 })

    // DIRECT API CALL (Bypasses the library version issues)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt: `Cinematic, photorealistic, 8k: ${prompt}` }],
          parameters: {
            sampleCount: 1,
            aspectRatio: "16:9",
            outputMimeType: "image/jpeg"
          }
        })
      }
    )

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Google API Error: ${errorText}`)
    }

    const data = await response.json()
    
    // Check if image exists in the response
    if (!data.predictions?.[0]?.bytesBase64Encoded) {
        throw new Error("No image data returned from Google")
    }

    const base64Image = `data:image/jpeg;base64,${data.predictions[0].bytesBase64Encoded}`

    return NextResponse.json({ url: base64Image, isBase64: true })

  } catch (error: any) {
    console.error('Image Gen Error:', error)
    return NextResponse.json({ error: error.message || 'Generation failed' }, { status: 500 })
  }
}