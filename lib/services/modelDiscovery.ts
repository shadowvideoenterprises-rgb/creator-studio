import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ModelCapabilities {
  id: string;
  name: string;
  type: 'text' | 'image' | 'audio';
  maxTokens?: number;
  costPer1k?: number;
  features: string[];
}

export class ModelDiscoveryService {
  private cache: Map<string, ModelCapabilities[]> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  async discoverGoogleModels(apiKey: string): Promise<ModelCapabilities[]> {
    const cacheKey = `google_${apiKey.slice(-8)}`;

    // Check cache
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // FIX: Use direct REST API instead of SDK for listing models
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const models: ModelCapabilities[] = [];

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Google API Error: ${response.statusText}`);
      
      const data = await response.json();
      // The API returns { models: [...] }
      const modelList = data.models || [];

      for (const model of modelList) {
        // Filter to ensure we only get relevant models
        if (!model.name.includes('gemini') && !model.name.includes('imagen')) continue;

        const capability: ModelCapabilities = {
          id: model.name.replace('models/', ''), // Clean up ID
          name: model.displayName || model.name,
          type: this.detectModelType(model.name),
          features: model.supportedGenerationMethods || [],
          maxTokens: model.outputTokenLimit,
        };
        capability.costPer1k = this.getPricing(model.name);
        models.push(capability);
      }

      // Cache results
      this.cache.set(cacheKey, models);
      this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_TTL);
      
      return models;
    } catch (error) {
      console.error('Model discovery failed:', error);
      return this.getFallbackModels('google');
    }
  }

  private detectModelType(modelName: string): 'text' | 'image' | 'audio' {
    if (modelName.includes('imagen') || modelName.includes('image')) return 'image';
    if (modelName.includes('audio') || modelName.includes('tts')) return 'audio';
    return 'text';
  }

  private isCacheValid(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    return !!expiry && Date.now() < expiry && this.cache.has(key);
  }

  private getPricing(modelId: string): number {
    const pricing: Record<string, number> = {
      'gemini-2.5-flash': 0.0001,
      'gemini-2.0-flash': 0.0001,
      'gemini-pro': 0.0005,
      'gemini-1.5-pro': 0.0005,
    };
    return pricing[modelId] || 0.0001;
  }

  private getFallbackModels(provider: 'google' | 'openai'): ModelCapabilities[] {
    if (provider === 'google') {
      return [
        {
          id: 'gemini-2.0-flash',
          name: 'Gemini 2.0 Flash (Fallback)',
          type: 'text',
          features: ['generateContent'],
          costPer1k: 0.0001,
        }
      ];
    }
    return [];
  }
}
