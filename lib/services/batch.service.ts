import { supabaseAdmin } from '@/lib/supabaseServer'
import { JobService } from '@/lib/services/job.service'
import { AssetService } from '@/lib/services/asset.service'
import { MediaService } from '@/lib/services/media.service'
import { AudioService } from '@/lib/services/audio.service'

export class BatchService {
  
  // --- VISUAL BATCH (Existing) ---
  static async processAllScenes(projectId: string, userId: string) {
    const jobId = await JobService.createJob(userId, 'asset_batch');

    (async () => {
      try {
        await JobService.updateProgress(jobId, 0, 'Starting visual generation...');
        const { data: scenes } = await supabaseAdmin
          .from('scenes')
          .select('*')
          .eq('project_id', projectId)
          .order('sequence_order', { ascending: true });

        if (!scenes || scenes.length === 0) throw new Error('No scenes found.');

        for (let i = 0; i < scenes.length; i++) {
          const scene = scenes[i];
          const progress = Math.round(((i + 1) / scenes.length) * 100);
          await JobService.updateProgress(jobId, progress, `Visuals for scene ${i + 1}...`);

          let assetData;
          if (i % 2 === 0) {
             assetData = await MediaService.searchStockVideo(scene.visual_description);
          } else {
             assetData = await MediaService.generateAIImage(scene.visual_description);
          }
          const safeData = assetData as any;

          await AssetService.saveAssetOption(scene.id, {
            type: safeData.type,
            source: safeData.source,
            url: safeData.url,
            external_id: safeData.external_id,
            prompt: safeData.prompt
          });
          await new Promise(r => setTimeout(r, 500));
        }
        await JobService.updateProgress(jobId, 100, 'Visuals complete.');
      } catch (error: any) {
        await JobService.failJob(jobId, error.message);
      }
    })();
    return jobId;
  }

  // --- AUDIO BATCH (New) ---
  static async processAudioBatch(projectId: string, userId: string) {
    const jobId = await JobService.createJob(userId, 'audio_gen');

    (async () => {
      try {
        await JobService.updateProgress(jobId, 0, 'Starting audio generation...');

        const { data: scenes } = await supabaseAdmin
          .from('scenes')
          .select('*')
          .eq('project_id', projectId)
          .order('sequence_order', { ascending: true });

        if (!scenes || scenes.length === 0) throw new Error('No scenes found.');

        for (let i = 0; i < scenes.length; i++) {
          const scene = scenes[i];
          const progress = Math.round(((i + 1) / scenes.length) * 100);
          
          await JobService.updateProgress(jobId, progress, `Generating voice for Scene ${scene.sequence_order}...`);

          // Call our new Audio Service
          if (scene.audio_text) {
             await AudioService.generateVoiceover(scene.id, scene.audio_text);
          }
          
          // Tiny delay to be nice to the free API
          await new Promise(r => setTimeout(r, 300));
        }

        await JobService.updateProgress(jobId, 100, 'Audio generation complete.');

      } catch (error: any) {
        console.error('Audio Batch Failed:', error);
        await JobService.failJob(jobId, error.message);
      }
    })();

    return jobId;
  }
}
