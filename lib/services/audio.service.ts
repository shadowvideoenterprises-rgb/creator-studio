import { supabaseAdmin } from '../supabaseServer'

export class AudioService {
  
  /**
   * Main Generator (Used by API)
   */
  static async generateAudio(projectId: string, sceneId: string, text: string, userId: string, userKeys: any = {}, selectedModel: string = 'mock-free') {
    console.log(`??? Generating audio for scene ${sceneId.slice(0, 5)}... Model: ${selectedModel}`);

    let assetUrl = null;
    let assetProvider = 'placeholder';

    // --- CASE 1: Mock / Free Mode ---
    if (selectedModel === 'mock-free' || !userKeys?.elevenlabs) {
       assetUrl = `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3`; 
       assetProvider = 'mock_audio';
    }

    if (assetUrl) {
      // Cleanup old audio
      await supabaseAdmin.from('scene_assets').delete().eq('scene_id', sceneId).eq('asset_type', 'audio');

      const { data, error } = await supabaseAdmin
        .from('scene_assets')
        .insert({
          project_id: projectId,
          scene_id: sceneId,
          asset_type: 'audio',
          asset_url: assetUrl,
          provider: assetProvider,
          status: 'ready',
          is_selected: true
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
    return null;
  }

  /**
   * Compatibility Alias (Fixed Type Error)
   */
  static async generateVoiceover(sceneId: string, text: string) {
    console.log('?? Using compatibility alias: generateVoiceover');
    
    // 1. Fetch scene and project info
    const { data: scene } = await supabaseAdmin
      .from('scenes')
      .select('project_id, project:projects(user_id)')
      .eq('id', sceneId)
      .single();

    if (!scene) throw new Error(`Scene ${sceneId} not found`);

    // --- FIX: Handle if project is returned as an array or object ---
    const projectData = scene.project;
    // @ts-ignore
    const userId = Array.isArray(projectData) ? projectData[0].user_id : projectData.user_id;

    // 2. Call main function
    return this.generateAudio(
      scene.project_id, 
      sceneId, 
      text, 
      userId, 
      {}, 
      'mock-free'
    );
  }
}
