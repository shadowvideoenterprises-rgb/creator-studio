import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ModelCapability {
  id: string;
  name: string;
  provider: 'google' | 'openai' | 'elevenlabs';
  type: 'text' | 'image' | 'audio' | 'multimodal';
  contextWindow?: number;
}

export class ModelDiscoveryService {
  
  // Safety Fallback if API fails
  private static FALLBACK_MODELS: Record<string, ModelCapability[]> = {
    google: [
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'google', type: 'multimodal', contextWindow: 1000000 },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'google', type: 'multimodal', contextWindow: 2000000 },
    ]
  };

  static async discoverGoogleModels(apiKey: string): Promise<ModelCapability[]> {
    if (!apiKey) return [];

    try {
      // We use REST API because the SDK listModels() can be restrictive
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      
      if (!response.ok) {
        console.warn('Google Discovery API failed, using fallbacks');
        return this.FALLBACK_MODELS.google;
      }

      const data = await response.json();
      
      const models: ModelCapability[] = (data.models || [])
        .filter((m: any) => 
            m.supportedGenerationMethods.includes('generateContent') || 
            m.name.includes('imagen')
        )
        .map((m: any) => {
            const isImage = m.name.includes('imagen');
            return {
                id: m.name.replace('models/', ''), 
                name: m.displayName,
                provider: 'google',
                type: isImage ? 'image' : 'multimodal',
                contextWindow: m.inputTokenLimit
            };
        });

      return models.sort((a, b) => b.id.localeCompare(a.id));

    } catch (error) {
      console.error("Model Discovery Failed:", error);
      return this.FALLBACK_MODELS.google;
    }
  }

  static async scanAll(apiKeys: { google?: string }) {
    const results: Record<string, ModelCapability[]> = {
      google: [],
      elevenlabs: []
    };

    if (apiKeys.google) {
      results.google = await this.discoverGoogleModels(apiKeys.google);
    }

    return results;
  }
}
