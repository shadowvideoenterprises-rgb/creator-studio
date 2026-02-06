import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: Request) {
  try {
    const { openai, gemini } = await req.json();
    const availableModels = [];

    // 1. Test OpenAI
    if (openai) {
      try {
        const client = new OpenAI({ apiKey: openai });
        // Tiny request to verify key
        await client.models.list(); 
        
        // If successful, add standard options
        availableModels.push({ id: 'gpt-4-turbo-preview', name: 'OpenAI GPT-4 Turbo', provider: 'openai' });
        availableModels.push({ id: 'gpt-3.5-turbo', name: 'OpenAI GPT-3.5 Turbo', provider: 'openai' });
      } catch (e) {
        console.warn('OpenAI Key Invalid');
      }
    }

    // 2. Test Gemini
    if (gemini) {
      try {
        const genAI = new GoogleGenerativeAI(gemini);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        // Tiny generation to verify
        await model.generateContent("Test");
        
        availableModels.push({ id: 'gemini-pro', name: 'Google Gemini Pro', provider: 'google' });
      } catch (e) {
        console.warn('Gemini Key Invalid');
      }
    }

    // 3. Always add the Free Path
    availableModels.push({ id: 'mock-free', name: 'Free / Mock Mode (No Key Required)', provider: 'internal' });

    return NextResponse.json({ 
      success: true, 
      models: availableModels 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}