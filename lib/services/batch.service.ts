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
          let assetData;
          if (i % 2 === 0) {
             assetData = await MediaService.searchStockVideo(scene.visual_description);
          } else {
             assetData = await MediaService.generateAIImage(scene.visual_description);
          }

          // FIX: Cast to 'any' so we can access optional fields (external_id / prompt)
          // without TypeScript complaining about Union types.
          const safeData = assetData as any;

          // 4. Save using the relational AssetService
          await AssetService.saveAssetOption(scene.id, {
            type: safeData.type,
            source: safeData.source,
            url: safeData.url,
            external_id: safeData.external_id, // Safe to access now (undefined if missing)
            prompt: safeData.prompt           // Safe to access now
          });

          // Optional: Artificial delay
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
