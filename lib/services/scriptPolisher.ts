import { GoogleGenerativeAI } from '@google/generative-ai';

export class ScriptPolisher {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async polishScript(scenes: any[], tone: string): Promise<any[]> {
    const model = this.genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash', 
        generationConfig: { responseMimeType: "application/json" } 
    });

    const prompt = `
      You are a professional video script editor. Improve this script to match the "${tone}" tone.
      
      CURRENT SCRIPT:
      ${JSON.stringify(scenes)}

      RULES:
      1. Remove repetitive phrases.
      2. Ensure "audio_text" is conversational (no "Ladies and gentlemen").
      3. Add "curiosity gaps" between scenes (make scene 1 lead into scene 2).
      4. CRITICAL: Keep "audio_text" short! Max 25 words per scene.
      
      Return JSON: { "scenes": [ ... ] }
    `;

    try {
        const result = await model.generateContent(prompt);
        const data = JSON.parse(result.response.text());
        return data.scenes || scenes; // Return polished or original if failed
    } catch (e) {
        console.error("Polish failed", e);
        return scenes;
    }
  }
}
