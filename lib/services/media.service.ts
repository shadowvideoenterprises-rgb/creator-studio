import { supabase } from '@/lib/supabaseClient'

export class MediaService {
  static async searchPexels(query: string) {
    const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15`, {
      headers: { Authorization: process.env.NEXT_PUBLIC_PEXELS_API_KEY! }
    })
    const data = await res.json()
    return data.photos?.map((p: any) => ({
      id: p.id,
      url: p.src.medium,
      original: p.src.original,
      source: 'pexels',
      type: 'photo'
    })) || []
  }

  static async attachAssetToScene(sceneId: string, assetUrl: string, source: string) {
    const { error } = await supabase
      .from('scenes')
      .update({ 
        asset_url: assetUrl, 
        asset_source: source,
        asset_type: 'stock_photo'
      })
      .eq('id', sceneId)
    
    return !error
  }
}