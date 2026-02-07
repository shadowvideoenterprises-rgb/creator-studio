import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabaseAdmin } from '@/lib/supabaseServer';

export class ImageService {
  
  // OPTIMIZATION: Check cache before paying Google
  static async getCachedImage(projectId: string, prompt: string): Promise<string | null> {
    // 1. Clean prompt for better matching (remove subtle variations)
    const cleanPrompt = prompt.toLowerCase().trim().slice(0, 100); 

    const { data } = await supabaseAdmin
      .from('asset_cache') // You will need to create this table or use existing 'scene_assets'
      .select('asset_url')
      .eq('project_id', projectId)
      .textSearch('prompt_summary', cleanPrompt) // Fuzzy match if setup, or exact match
      .limit(1)
      .single();

    return data?.asset_url || null;
  }

  static async generateImage(apiKey: string, prompt: string, modelId: string = 'imagen-3.0-generate-001'): Promise<{ url: string, provider: string }> {
    
    // Fallback: Pollinations (Free) if no Key
    if (!apiKey) {
        console.log("No API Key, using Pollinations...");
        const seed = Math.floor(Math.random() * 9999);
        return {
            url: `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?nologo=true&seed=${seed}`,
            provider: 'pollinations-ai'
        };
    }

    // Google Imagen Strategy
    try {
        console.log(`Generating with ${modelId}...`);
        
        // Note: The Google GenAI SDK handles Imagen differently in newer versions.
        // We use the REST method for maximum compatibility with the specific "generate-001" models.
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:predict?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                instances: [{ prompt: `High quality YouTube thumbnail, ${prompt}` }],
                parameters: { aspectRatio: "16:9", sampleCount: 1 }
            })
        });

        const data = await response.json();
        
        if (data.predictions?.[0]?.bytesBase64Encoded) {
            return {
                url: `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`,
                provider: `google-${modelId}`
            };
        }
        
        throw new Error(data.error?.message || "Unknown GenAI Error");

    } catch (e) {
        console.error("Imagen failed, trying backup...", e);
        // Backup: Pollinations
        return {
            url: `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?nologo=true`,
            provider: 'pollinations-fallback'
        };
    }
  }
}
