import { supabaseAdmin } from '@/lib/supabaseServer'
import crypto from 'crypto'

export class AssetCache {
  
  // Create a consistent hash for a prompt
  private static hashPrompt(prompt: string, model: string): string {
    const normalize = prompt.trim().toLowerCase() + `|model:${model}`;
    return crypto.createHash('sha256').update(normalize).digest('hex');
  }

  static async get(prompt: string, assetType: 'image' | 'audio', model: string) {
    const hash = this.hashPrompt(prompt, model);
    
    const { data } = await supabaseAdmin
      .from('asset_cache')
      .select('asset_url, hit_count')
      .eq('prompt_hash', hash)
      .eq('asset_type', assetType)
      .single();

    if (data) {
        // Async update hit count (don't await, speed is key)
        supabaseAdmin.from('asset_cache')
            .update({ 
                hit_count: (data.hit_count || 0) + 1,
                last_used: new Date().toISOString()
            })
            .eq('prompt_hash', hash)
            .then(() => {}); // Fire and forget
            
        console.log(`🎯 CACHE HIT: ${assetType} (${prompt.substring(0,20)}...)`);
        return data.asset_url;
    }
    
    return null;
  }

  static async set(prompt: string, assetType: 'image' | 'audio', url: string, model: string) {
    if (!url || !prompt) return;
    const hash = this.hashPrompt(prompt, model);
    
    try {
        await supabaseAdmin.from('asset_cache').upsert({
            prompt_hash: hash,
            asset_type: assetType,
            asset_url: url,
            model_used: model,
            last_used: new Date().toISOString()
        }, { onConflict: 'prompt_hash' });
    } catch (e) {
        console.warn("Cache Write Failed:", e);
    }
  }
}
