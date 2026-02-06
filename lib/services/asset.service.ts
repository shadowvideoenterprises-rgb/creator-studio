import { supabaseAdmin } from '@/lib/supabaseServer'
import { SceneAsset } from '@/lib/types'

export class AssetService {
  /**
   * Saves a new asset option for a scene.
   * If it's the first asset, it auto-selects it.
   */
  static async saveAssetOption(sceneId: string, asset: Partial<SceneAsset>) {
    // 1. Check if scene has any assets yet
    const { count } = await supabaseAdmin
      .from('scene_assets')
      .select('*', { count: 'exact', head: true })
      .eq('scene_id', sceneId)

    const isFirst = count === 0

    // 2. Insert the new asset
    const { data, error } = await supabaseAdmin
      .from('scene_assets')
      .insert({
        scene_id: sceneId,
        type: asset.type,
        source: asset.source,
        url: asset.url,
        prompt: asset.prompt,
        external_id: asset.external_id,
        is_selected: isFirst // Auto-select if first
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Sets a specific asset as the "selected" one for the scene
   * and unselects all others.
   */
  static async selectAsset(sceneId: string, assetId: string) {
    // 1. Unselect all for this scene
    await supabaseAdmin
      .from('scene_assets')
      .update({ is_selected: false })
      .eq('scene_id', sceneId)

    // 2. Select the chosen one
    await supabaseAdmin
      .from('scene_assets')
      .update({ is_selected: true })
      .eq('id', assetId)
  }
}