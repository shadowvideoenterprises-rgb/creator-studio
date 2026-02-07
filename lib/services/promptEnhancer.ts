import { GoogleGenerativeAI } from '@google/generative-ai';

export class PromptEnhancer {
  
  static async enhance(originalPrompt: string, apiKey: string): Promise<string> {
    if (!apiKey || !originalPrompt) return originalPrompt;

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const SYSTEM_PROMPT = `
      You are an expert AI Art Director. 
      Rewrite the following description into a highly detailed, professional image generation prompt.
      
      RULES:
      1. Keep it under 40 words.
      2. Add style keywords: "cinematic", "photorealistic", "8k", "dramatic lighting".
      3. Describe the subject, lighting, camera angle, and mood.
      4. RETURN ONLY THE RAW PROMPT TEXT. NO MARKDOWN. NO QUOTES.
      
      Input: "${originalPrompt}"
      `;

      const result = await model.generateContent(SYSTEM_PROMPT);
      const enhanced = result.response.text().trim();
      
      // Safety check: if it fails or returns empty, use original
      return enhanced.length > 10 ? enhanced : originalPrompt;

    } catch (error) {
      console.warn("Prompt Enhancement Failed:", error);
      return originalPrompt; // Fail safe
    }
  }
}
