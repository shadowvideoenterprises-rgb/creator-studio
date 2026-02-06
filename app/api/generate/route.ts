import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
        return NextResponse.json({ 
            data: [{ audio: "Error: No API Key.", visual: "Check .env.local", type: "Stock Video" }] 
        })
    }

    // UPDATED MODEL: Using 'gemini-2.5-flash' from your list.
    // This is the specific model ID for the version you have access to.
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `
              You are a JSON generator. 
              Topic: ${prompt}
              Output: A raw JSON array of 3 objects.
              Keys: "audio", "visual", "type".
              NO Markdown. NO code blocks.
              Example: [{"audio":"Hi","visual":"Wave","type":"Stock Video"}]
            `
          }]
        }]
      })
    })

    if (!response.ok) {
        // If 2.5 fails, we automatically fallback to 2.0 (just in case)
        if (response.status === 404) {
             console.log("Gemini 2.5 not found, trying 2.0...")
             return fallbackToGemini2(prompt, apiKey)
        }
        const errorText = await response.text()
        throw new Error(`Google API Error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""

    // CLEANER (Extract the JSON)
    const start = text.indexOf('[')
    const end = text.lastIndexOf(']') + 1

    if (start !== -1 && end > start) {
        const jsonStr = text.slice(start, end)
        return NextResponse.json({ data: JSON.parse(jsonStr) })
    }

    throw new Error("No JSON array found in response")

  } catch (error: any) {
    console.error("Script Gen Error:", error)
    return NextResponse.json({ 
        data: [
            { audio: "Script generation hit a bump.", visual: "Glitch Art", type: "Stock Video" },
            { audio: `Error: ${error.message.substring(0, 100)}`, visual: "Error Text", type: "Stock Video" }
        ]
    })
  }
}

// Helper: Backup function if 2.5 isn't live for your key yet
async function fallbackToGemini2(prompt: string, apiKey: string) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Create 3 video scenes about: ${prompt}. Return strictly a JSON array with keys: audio, visual, type.` }] }]
      })
    })
    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
    const start = text.indexOf('[')
    const end = text.lastIndexOf(']') + 1
    if (start !== -1) {
        return NextResponse.json({ data: JSON.parse(text.slice(start, end)) })
    }
    return NextResponse.json({ data: [{ audio: "Fallback failed", visual: "Error", type: "Stock Video" }] })
}