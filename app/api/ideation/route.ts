import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'
import { supabaseAdmin } from '@/lib/supabaseServer'

export async function POST(req: Request) {
  try {
    const { topic, style, userId, model } = await req.json()

    // 1. Fetch Keys
    const { data: settings } = await supabaseAdmin
        .from('user_settings')
        .select('api_keys')
        .eq('user_id', userId)
        .single()
        
    const keys = settings?.api_keys || {}

    // 2. Determine Provider based on Model ID
    const isGoogle = model.includes('gemini') || model.includes('banana') || model.includes('gemma');
    const isOpenAI = model.includes('gpt');

    let ideas = [];

    // --- GOOGLE GEMINI EXECUTION ---
    if (isGoogle) {
        if (!keys.google) throw new Error("No Google Key found")
        const genAI = new GoogleGenerativeAI(keys.google)
        
        // FIX: Ensure ID has 'models/' prefix
        const modelId = model.startsWith('models/') ? model : `models/${model}`
        
        const aiModel = genAI.getGenerativeModel({ 
            model: modelId,
            generationConfig: { responseMimeType: "application/json" } // FIX: Force JSON
        })

        const prompt = `You are a YouTube viral strategist. Generate 5 video ideas about "${topic}" in a "${style}" style.
        Return ONLY a raw JSON object with this exact schema:
        {
          "ideas": [
            { "title": "Clickbait Title", "hook": "The first sentence...", "score": 95, "angle": "Controversial" }
          ]
        }`

        const result = await aiModel.generateContent(prompt)
        const text = result.response.text()
        const json = JSON.parse(text)
        ideas = json.ideas

    // --- OPENAI EXECUTION ---
    } else if (isOpenAI) {
        if (!keys.openai) throw new Error("No OpenAI Key found")
        const openai = new OpenAI({ apiKey: keys.openai })
        
        const completion = await openai.chat.completions.create({
            model: model, // GPT-4o, etc.
            messages: [
                { role: "system", content: "You are a JSON generator." },
                { role: "user", content: `Generate 5 viral YouTube ideas for "${topic}". Return JSON: { "ideas": [{ "title": "", "hook": "", "score": 90, "angle": "" }] }` }
            ],
            response_format: { type: "json_object" }
        })
        
        const text = completion.choices[0].message.content || "{}"
        const json = JSON.parse(text)
        ideas = json.ideas
    }

    return NextResponse.json({ ideas })

  } catch (error: any) {
    console.error("Ideation Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
