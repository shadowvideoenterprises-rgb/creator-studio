import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { JobService } from '@/lib/services/job.service'
import { AssetService } from '@/lib/services/asset.service'

export async function POST(req: Request) {
  try {
    // Read parameters
    const { projectId, userId, keys, model } = await req.json();

    if (!projectId || !userId) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    // 1. Get all scenes for project
    const { data: scenes } = await supabaseAdmin
      .from('scenes')
      .select('*')
      .eq('project_id', projectId)
      .order('sequence_order', { ascending: true });

    if (!scenes || scenes.length === 0) {
      return NextResponse.json({ error: 'No scenes found' }, { status: 404 });
    }

    // 2. Create Job (FIXED TYPO: 'asset_batch')
    const jobId = await JobService.createJob(userId, 'asset_batch');

    // 3. Start Async Processing
    (async () => {
        try {
            let completed = 0;
            for (const scene of scenes) {
                const percent = Math.round((completed / scenes.length) * 100);
                await JobService.updateProgress(jobId, percent, `Processing Scene ${scene.sequence_order}/${scenes.length}...`);
                
                // Pass the 'model' down to the service
                await AssetService.generateAsset(projectId, scene.id, scene.visual_description, userId, keys, model);
                completed++;
            }
            await JobService.updateProgress(jobId, 100, 'Visuals generated.');
        } catch (e: any) {
            console.error('Batch failed:', e);
            await JobService.failJob(jobId, e.message);
        }
    })();

    return NextResponse.json({ success: true, jobId });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
