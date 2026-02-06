import { supabaseAdmin } from '../supabaseServer'
import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'

export class ScriptService {
  static async generateScript(projectId: string, title: string, context: string, userKeys: any = {}, selectedModel: string = 'mock-free') {
    console.log(`?? Script Gen Start. Model: ${selectedModel}`);
    
    let scenes = [];

    // --- CASE 1: OpenAI Selected ---
    // Safe check: ensure userKeys exists AND has openai property
    if (selectedModel?.startsWith('gpt') && userKeys?.openai) {
      try {
        console.log('?? Using OpenAI...');
        const openai = new OpenAI({ apiKey: userKeys.openai });
        const completion = await openai.chat.completions.create({
          messages: [
            { role: "system", content: "You are a viral video script writer. Generate a JSON response with an array of 5 scenes. Each scene must have 'visual_description' (for AI image gen) and 'audio_text' (for voiceover)." },
            { role: "user", content: `Title: ${title}. Context: ${context}` }
          ],
          model: selectedModel,
          response_format: { type: "json_object" },
        });
        const content = completion.choices[0].message.content;
        if (content) scenes = JSON.parse(content).scenes || [];
      } catch (e) { console.warn('?? OpenAI failed, falling back:', e); }
    }

    // --- CASE 2: Gemini Selected ---
    else if (selectedModel?.startsWith('gemini') && userKeys?.gemini) {
      try {
        console.log('? Using Gemini...');
        const genAI = new GoogleGenerativeAI(userKeys.gemini);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `Generate a JSON object with a "scenes" array (5 items) for a video titled "${title}". Each scene needs "visual_description" and "audio_text". Return ONLY JSON.`;
        
        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        scenes = JSON.parse(text).scenes || [];
      } catch (e) { console.warn('?? Gemini failed, falling back:', e); }
    }

    // --- CASE 3: Free/Mock (Default or Fallback) ---
    // This runs if NO SCENES were generated above (due to error or missing key)
    if (!scenes || scenes.length === 0) {
      console.log('?? Using Mock / Free Path');
      scenes = [
        { sequence_order: 1, visual_description: "High contrast cinematic hook", audio_text: `Stop scrolling. You won't believe the truth about ${title}.` },
        { sequence_order: 2, visual_description: "Fast paced archival montage", audio_text: "For years we were told one story, but new evidence changes everything." },
        { sequence_order: 3, visual_description: "Split screen comparison", audio_text: "Here is the detail everyone missed." },
        { sequence_order: 4, visual_description: "3D animated breakdown", audio_text: "When you analyze the data, the math proves the opposite." },
        { sequence_order: 5, visual_description: "Host walking into light", audio_text: "Subscribe for more insights like this." }
      ];
    }

    // Save to Database
    const { error } = await supabaseAdmin
      .from('scenes')
      .insert(scenes.map((s: any, i: number) => ({
        project_id: projectId,
        sequence_order: i + 1,
        visual_description: s.visual_description,
        audio_text: s.audio_text,
        status: 'draft'
      })));

    if (error) {
        console.error('Supabase Write Error:', error);
        throw error;
    }
    return scenes;
  }
}
