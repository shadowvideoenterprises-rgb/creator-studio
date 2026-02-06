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
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
    // Generate Content
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({ text })
    
  } catch (error) {
    console.error('AI Error:', error)
    return NextResponse.json({ error: 'Failed to generate script' }, { status: 500 })
  }
}