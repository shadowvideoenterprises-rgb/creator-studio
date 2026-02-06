import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY
    
    // 1. Safety Check: Do we have a key?
    if (!apiKey) {
        return NextResponse.json({ 
            data: [
                { audio: "System Error: Missing API Key.", visual: "Error screen", type: "Stock Video" }
            ] 
        })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // 2. The Request
    const aiPrompt = `
      You are a video script generator. Output ONLY valid JSON.
      Topic: ${prompt}
      Format: An array of 3 scene objects.
      Example: [{"audio": "Hook...", "visual": "Scene 1...", "type": "Stock Video"}]
      IMPORTANT: Do not write markdown, code blocks, or explanations. Just the array.
    `

    const result = await model.generateContent(aiPrompt)
    const text = result.response.text()
    console.log("AI Raw Output:", text) // Check Vercel Logs to see exactly what it said

    // 3. The "Unbreakable" Parser
    try {
        // Attempt to clean markdown if present (```json ... ```)
        let cleanText = text.replace(/```json/g, '').replace(/```/g, '')
        
        // Find the array brackets no matter where they are
        const start = cleanText.indexOf('[')
        const end = cleanText.lastIndexOf(']') + 1
        
        if (start === -1 || end === 0) throw new Error("No brackets found")

        const jsonString = cleanText.slice(start, end)
        const parsedData = JSON.parse(jsonString)
        
        // Success! Return the AI data
        return NextResponse.json({ data: parsedData })

    } catch (parseError) {
        console.error("Parsing Failed:", parseError)
        
        // 4. THE SAFETY NET (If AI fails, we send this instead of crashing)
        return NextResponse.json({ 
            data: [
                { audio: "The AI created a script for " + prompt, visual: "Title card with text " + prompt, type: "Stock Video" },
                { audio: "However, the formatting was slightly off.", visual: "Glitch effect background", type: "Stock Video" },
                { audio: "Please try clicking 'Reroll' for a better result.", visual: "Reload icon spinning", type: "Stock Video" }
            ] 
        })
    }
    
  } catch (error: any) {
    console.error("Critical Error:", error)
    return NextResponse.json({ error: "Server Error" }, { status: 500 })
  }
}