import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function generateScript(title: string, pacing: string = 'Cinematic') {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  })

  // This relies on the logic from your original 'ScriptService'
  const prompt = `
    ROLE: You are an elite video director.
    TASK: Write a structured script for a video titled: "${title}".
    PACING: ${pacing} (Fast cuts if 'Fast', slow pans if 'Cinematic').
    
    REQUIREMENTS:
    1.  Output a raw JSON Array of scene objects.
    2.  "visual": detailed description of the stock footage/image needed.
    3.  "audio": the voiceover text for this exact shot.
    4.  "type": "Stock Video" or "Stock Photo".
    5.  "duration": estimated seconds (e.g., 3, 5, 8).
    
    STRICT FORMAT:
    [
      { "audio": "...", "visual": "...", "type": "Stock Video", "duration": 5 },
      ...
    ]
  `

  const result = await model.generateContent(prompt)
  const response = await result.response
  return JSON.parse(response.text())
}