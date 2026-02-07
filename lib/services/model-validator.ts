import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { VALID_SCRIPT_MODELS, VALID_IMAGE_MODELS, VALID_AUDIO_MODELS } from '../model-constants'

export interface ModelCapability {
  id: string
  name: string
  provider: 'openai' | 'google' | 'anthropic'
}

export class ModelValidatorService {
  
  // --- OPENAI (Unchanged) ---
  static async validateOpenAI(apiKey: string): Promise<{ valid: boolean, models: ModelCapability[], error?: string }> {
    try {
      const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true }) 
      const list = await openai.models.list()
      
      try { await openai.chat.completions.create({ model: "gpt-3.5-turbo", messages: [{ role: "user", content: "Hi" }], max_tokens: 1 }); } 
      catch (e: any) { throw new Error("Key is valid, but account has no quota/credits."); }

      const validModels = list.data
        .map(m => m.id)
        .filter(id => {
            const isScript = VALID_SCRIPT_MODELS.some(valid => id.includes(valid));
            const isImage = VALID_IMAGE_MODELS.some(valid => id.includes(valid));
            return isScript || isImage;
        })
        .map(id => ({ id, name: id, provider: 'openai' as const }))
        .sort((a, b) => b.id.localeCompare(a.id))

      return { valid: true, models: validModels }

    } catch (e: any) {
      return { valid: false, models: [], error: e.message }
    }
  }

  // --- GEMINI (Clean List Scan) ---
  static async validateGemini(apiKey: string): Promise<{ valid: boolean, models: ModelCapability[], error?: string }> {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
      const data = await response.json()

      if (data.error) throw new Error(data.error.message)
      if (!data.models) throw new Error("No models found.")

      let validModels = data.models
        .map((m: any) => {
            const id = m.name.replace('models/', '')
            return { id, name: m.displayName || id, provider: 'google' as const }
        })
        .filter((m: any) => {
            // STRICT CHECK: Does this ID exist in our Master Constants?
            const isScript = VALID_SCRIPT_MODELS.some(valid => m.id === valid || m.id.includes(valid));
            const isImage = VALID_IMAGE_MODELS.some(valid => m.id === valid || m.id.includes(valid));
            return isScript || isImage;
        })

      // Manually ADD Nano Banana if we see Gemini 3 (because Nano Banana often doesn't appear in list)
      const hasGemini3 = validModels.some((m: any) => m.id.includes('gemini-3'));
      if (hasGemini3) {
           if (!validModels.some((m: any) => m.id === 'nano-banana-pro')) {
               validModels.push({ id: 'nano-banana-pro', name: 'Nano Banana Pro', provider: 'google' });
           }
      }

      validModels.sort((a: any, b: any) => b.id.localeCompare(a.id))
      return { valid: true, models: validModels }

    } catch (e: any) {
      return { valid: false, models: [], error: e.message }
    }
  }

  static async validateAnthropic(apiKey: string): Promise<{ valid: boolean, models: ModelCapability[], error?: string }> {
      return { valid: false, models: [], error: "Anthropic Disabled" }
  }
}
