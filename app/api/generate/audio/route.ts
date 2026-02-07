import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { JobService } from '@/lib/services/job.service'
import { AudioService } from '@/lib/services/audioService'

export async function POST(req: Request) {
  try {
    const { projectId, userId } = await req.json();

    if (!projectId || !userId) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    // 1. Get Project Scenes & Settings
    const { data: scenes } = await supabaseAdmin
      .from('scenes')
      .select('*')
      .eq('project_id', projectId)
      .order('sequence_order', { ascending: true });

    const { data: settings } = await supabaseAdmin
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!scenes || scenes.length === 0) return NextResponse.json({ error: 'No scenes' }, { status: 404 });

    // 2. Create Job
    const jobId = await JobService.createJob(userId, 'audio_gen');

    // 3. Process Async
    (async () => {
        try {
            let completed = 0;
            for (const scene of scenes) {
                // Update Progress
                const percent = Math.round((completed / scenes.length) * 100);
                await JobService.updateProgress(jobId, percent, `Voicing Scene ${scene.sequence_order}...`);

                // Generate if text exists and no audio yet (or forcing regen)
                if (scene.audio_text && scene.audio_text.length > 0) {
                    
                    const result = await AudioService.generateVoiceover(scene.audio_text, settings);
                    
                    // Save to DB (We store the Base64 Data URI directly in asset_url for now)
                    // In a large scale app, you would upload 'result.audioData' to Supabase Storage and save the URL.
                    await supabaseAdmin.from('scene_assets').insert({
                        project_id: projectId,
                        scene_id: scene.id,
                        asset_type: 'audio',
                        asset_url: result.audioData, 
                        provider: result.provider
                    });
                }
                completed++;
            }
            await JobService.updateProgress(jobId, 100, 'Audio generated.');
        } catch (e: any) {
            console.error('Audio Job failed:', e);
            await JobService.failJob(jobId, e.message);
        }
    })();

    return NextResponse.json({ success: true, jobId });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
