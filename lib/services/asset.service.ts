import { supabaseAdmin } from '../supabaseServer'
// We use 'any' for the type import in the test environment to avoid deep linking issues
// The real build will still work fine
export class AssetService {
  static async saveAssetOption(sceneId: string, asset: any) {
    const { count } = await supabaseAdmin
      .from('scene_assets')
      .select('*', { count: 'exact', head: true })
      .eq('scene_id', sceneId)

    const isFirst = count === 0

    const { data, error } = await supabaseAdmin
      .from('scene_assets')
      .insert({
        scene_id: sceneId,
        type: asset.type,
        source: asset.source,
        url: asset.url,
        prompt: asset.prompt,
        external_id: asset.external_id,
        is_selected: isFirst
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async selectAsset(sceneId: string, assetId: string) {
    await supabaseAdmin
      .from('scene_assets')
      .update({ is_selected: false })
      .eq('scene_id', sceneId)

    await supabaseAdmin
      .from('scene_assets')
      .update({ is_selected: true })
      .eq('id', assetId)
  }
}
