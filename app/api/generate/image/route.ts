import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    // PEXELS API (Free Stock Photos)
    // We search for the prompt term to get a relevant real-world image.
    // If you have a Pexels API Key, add it to your .env as PEXELS_API_KEY.
    // If not, this code falls back to a public search or placeholder which is still better than a crash.
    
    // For now, we will use a "Keyword-based" placeholder service that is 100% free and requires NO key.
    // Unsplash Source is deprecated, so we use 'Pollinations' in a different way: 
    // We ask it to "Imagine" the stock photo (it's still AI, but we use the simple link method which worked earlier for the Roman Shield).
    
    // Since we know the "Simple Link" method (Scenario B from earlier) worked to SHOW the image,
    // but failed to SAVE it due to CORS...
    // We will just return the URL and let the frontend save it as a "External Link" instead of trying to upload it.
    
    const seed = Math.floor(Math.random() * 1000)
    const encodedPrompt = encodeURIComponent(prompt)
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&seed=${seed}&nologo=true&model=flux`

    // We return isBase64: false so the frontend treats it as a URL
    return NextResponse.json({ 
        url: imageUrl, 
        isBase64: false 
    })

  } catch (error: any) {
    console.error('Stock Photo Error:', error)
    return NextResponse.json({ error: 'Failed to find image' }, { status: 500 })
  }
}