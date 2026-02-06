import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { text, voiceId = "21m00Tcm4TlvDq8ikWAM" } = await req.json() // Default "Rachel" voice
    
    if (!process.env.ELEVENLABS_API_KEY) {
        return NextResponse.json({ error: 'Missing ElevenLabs Key' }, { status: 500 })
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY!,
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_monolingual_v1",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
      }),
    })

    if (!response.ok) throw new Error('ElevenLabs API Failed')

    // Get the audio as a binary blob
    const audioArrayBuffer = await response.arrayBuffer()
    const base64Audio = Buffer.from(audioArrayBuffer).toString('base64')
    
    // Return Base64 so frontend can play it/upload it
    return NextResponse.json({ audio: `data:audio/mpeg;base64,${base64Audio}` })
    
  } catch (error: any) {
    console.error('Audio Gen Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}