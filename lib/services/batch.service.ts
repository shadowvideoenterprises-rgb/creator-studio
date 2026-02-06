import { supabaseAdmin } from '@/lib/supabaseServer'
import { JobService } from '@/lib/services/job.service'
import { AssetService } from '@/lib/services/asset.service'
import { MediaService } from '@/lib/services/media.service'

export class BatchService {
  
  static async processAllScenes(projectId: string, userId: string) {
    // 1. Create a background job
    const jobId = await JobService.createJob(userId, 'asset_batch');

    // Fire and forget logic (async execution)
    (async () => {
      try {
        await JobService.updateProgress(jobId, 0, 'Starting batch generation...');

        // 2. Fetch all scenes for the project
        const { data: scenes } = await supabaseAdmin
          .from('scenes')
          .select('*')
          .eq('project_id', projectId)
          .order('sequence_order', { ascending: true });

        if (!scenes || scenes.length === 0) {
          throw new Error('No scenes found for this project.');
        }

        const total = scenes.length;
        
        // 3. Iterate and Generate
        for (let i = 0; i < total; i++) {
          const scene = scenes[i];
          const progress = Math.round(((i + 1) / total) * 100);

          await JobService.updateProgress(jobId, progress, `Processing scene ${i + 1} of ${total}...`);

          // Decision Logic: Video or Image? 
          // (Simple heuristic: odd scenes = video, even = image for demo)
          let assetData;
          if (i % 2 === 0) {
             assetData = await MediaService.searchStockVideo(scene.visual_description);
          } else {
             assetData = await MediaService.generateAIImage(scene.visual_description);
          }

          // 4. Save using the relational AssetService
          await AssetService.saveAssetOption(scene.id, {
            type: assetData.type as any,
            source: assetData.source as any,
            url: assetData.url,
            external_id: assetData.external_id,
            prompt: assetData.prompt
          });

          // Optional: Artificial delay to simulate API latency and test the progress bar
          await new Promise(r => setTimeout(r, 800));
        }

        await JobService.updateProgress(jobId, 100, 'Batch generation complete.');

      } catch (error: any) {
        console.error('Batch Job Failed:', error);
        await JobService.failJob(jobId, error.message);
      }
    })();

    return jobId;
  }
}