// Changed to relative import for compatibility with local test scripts
import { supabaseAdmin } from '../supabaseServer'

export class ProjectService {
  static async exportProjectPackage(projectId: string) {
    const { data: project, error: projError } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()
    
    if (projError || !project) throw new Error('Project not found')

    const { data: scenes, error: sceneError } = await supabaseAdmin
      .from('scenes')
      .select('*, scene_assets!inner(*)')
      .eq('project_id', projectId)
      .eq('scene_assets.is_selected', true)
      .order('sequence_order', { ascending: true })

    if (sceneError) throw new Error(`Failed to fetch scenes: ${sceneError.message}`)

    const exportPackage = {
      version: '1.0',
      project: {
        id: project.id,
        title: project.title,
        created_at: project.created_at,
        stats: {
          scene_count: scenes?.length || 0,
          estimated_duration: (scenes?.length || 0) * 5
        }
      },
      timeline: scenes?.map(scene => ({
        sequence: scene.sequence_order,
        narration: {
          text: scene.audio_text,
        },
        visual: {
          description: scene.visual_description,
          asset_url: scene.scene_assets[0]?.url,
          asset_type: scene.scene_assets[0]?.type,
          source: scene.scene_assets[0]?.source
        }
      }))
    }

    return exportPackage
  }
}
