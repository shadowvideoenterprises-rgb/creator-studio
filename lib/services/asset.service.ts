import { supabaseAdmin } from '../supabaseServer'

export class AssetService {
  
  /**
   * Selects an asset for a scene (Mutually Exclusive)
   */
  static async selectAsset(sceneId: string, assetId: string) {
    // 1. Unselect ALL assets for this scene
    await supabaseAdmin
      .from('scene_assets')
      .update({ is_selected: false })
      .eq('scene_id', sceneId);

    // 2. Select the target asset
    const { data, error } = await supabaseAdmin
      .from('scene_assets')
      .update({ is_selected: true })
      .eq('id', assetId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async saveAssetOption(
    sceneId: string, 
    data: { 
      type: 'image' | 'video' | 'stock' | 'audio' | 'ai_image' | 'ai_video'; 
      source: string; 
      url: string;
      external_id?: string;
      prompt?: string;
    }
  ) {
     const { data: scene } = await supabaseAdmin
       .from('scenes')
       .select('project_id')
       .eq('id', sceneId)
       .single();

     if (!scene) throw new Error(`Scene ${sceneId} not found`);

     // When saving a NEW asset, check if it's the first one. If so, select it automatically.
     const { count } = await supabaseAdmin
        .from('scene_assets')
        .select('*', { count: 'exact', head: true })
        .eq('scene_id', sceneId);

     const isFirst = count === 0;

     const { data: insertedAsset, error } = await supabaseAdmin
       .from('scene_assets')
       .insert({
         project_id: scene.project_id,
         scene_id: sceneId,
         asset_type: data.type,
         asset_url: data.url,
         provider: data.source,
         prompt_used: data.prompt || null,
         status: 'ready',
         is_selected: isFirst // Auto-select if first
       })
       .select()
       .single();

     if (error) throw error;
     return insertedAsset;
  }

  static async generateAsset(projectId: string, sceneId: string, prompt: string, userId: string, userKeys: any = {}, selectedModel: string = 'mock-free') {
    console.log(`?? Generating asset for scene ${sceneId.slice(0, 5)}... Model: ${selectedModel}`);

    let assetUrl = null;
    let assetProvider = 'placeholder';

    if (selectedModel === 'mock-free') {
       assetUrl = `https://placehold.co/800x450/2a2a2a/FFF.png?text=MOCK+VISUAL+FOR+SCENE`;
       assetProvider = 'mock_free';
    }

    if (assetUrl) {
      // Auto-select logic for generated assets
      const { count } = await supabaseAdmin
        .from('scene_assets')
        .select('*', { count: 'exact', head: true })
        .eq('scene_id', sceneId);

      const { data, error } = await supabaseAdmin
        .from('scene_assets')
        .insert({
          project_id: projectId,
          scene_id: sceneId,
          asset_type: 'image',
          asset_url: assetUrl,
          provider: assetProvider,
          prompt_used: prompt,
          status: 'ready',
          is_selected: count === 0
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
        return null;
    }
  }
}
