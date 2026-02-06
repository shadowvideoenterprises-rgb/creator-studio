import { supabase } from '@/lib/supabaseClient'

export class MediaService {
  
  // --- Phase 1: UI Methods (Client-Side) ---

  /**
   * Called by MediaModal to save a manually selected asset.
   * Updates BOTH the legacy scene column and the new relational table.
   */
  static async attachAssetToScene(sceneId: string, url: string, source: string) {
    try {
      console.log(`Attaching asset to scene ${sceneId}: ${url}`);

      // 1. Legacy Update (Quick UI Feedback)
      const { error: sceneError } = await supabase
        .from('scenes')
        .update({ 
          asset_url: url,
          asset_type: url.includes('.mp4') ? 'video' : 'image'
        })
        .eq('id', sceneId);

      if (sceneError) throw sceneError;

      // 2. Future-Proof Update (Add to Version History)
      // We check if this asset already exists in the history to avoid duplicates
      const { data: existing } = await supabase
        .from('scene_assets')
        .select('id')
        .eq('scene_id', sceneId)
        .eq('url', url)
        .single();

      if (!existing) {
        await supabase.from('scene_assets').insert({
          scene_id: sceneId,
          type: url.includes('.mp4') ? 'stock' : 'ai_image',
          source: source as any,
          url: url,
          is_selected: true // Manually picked = Auto selected
        });

        // Ensure other assets for this scene are unselected
        await supabase
          .from('scene_assets')
          .update({ is_selected: false })
          .eq('scene_id', sceneId)
          .neq('url', url);
      }

      return true;
    } catch (error) {
      console.error('Failed to attach asset:', error);
      return false;
    }
  }

  static async searchPexels(query: string) {
    console.log(`UI Searching Pexels for: ${query}`);
    return Array.from({ length: 6 }).map((_, i) => ({
      id: `pexels-${Date.now()}-${i}`,
      type: i % 2 === 0 ? 'image' : 'video',
      source: 'pexels',
      url: i % 2 === 0 
        ? 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        : 'https://files.vidstack.io/sprite-fight/720p.mp4',
      thumbnail: i % 2 === 0 
        ? 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=400'
        : 'https://files.vidstack.io/sprite-fight/poster.webp',
      alt: `Result for ${query}`
    }));
  }

  static async searchUnsplash(query: string) { return []; }
  static async searchPixabay(query: string) { return []; }

  // --- Phase 2: Batch/AI Methods (Server-Side Compatible) ---
  
  static async searchStockVideo(query: string) {
    return {
      type: 'stock',
      source: 'pexels',
      url: 'https://files.vidstack.io/sprite-fight/720p.mp4', 
      external_id: 'vid_' + Date.now()
    };
  }

  static async generateAIImage(prompt: string) {
    return {
      type: 'ai_image',
      source: 'imagen',
      url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80',
      prompt: prompt
    };
  }
}
