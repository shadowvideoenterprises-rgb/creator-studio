import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { JobService } from '@/lib/services/job.service'
import { AudioService } from '@/lib/services/audio.service'

export async function POST(req: Request) {
  try {
    const { projectId, userId, keys, model } = await req.json();

    if (!projectId || !userId) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    // 1. Get scenes that have text to speak
    const { data: scenes } = await supabaseAdmin
      .from('scenes')
      .select('*')
      .eq('project_id', projectId)
      .order('sequence_order', { ascending: true });

    if (!scenes || scenes.length === 0) return NextResponse.json({ error: 'No scenes' }, { status: 404 });

    // 2. Create Job
    const jobId = await JobService.createJob(userId, 'audio_gen');

    // 3. Process Async
    (async () => {
        try {
            let completed = 0;
            for (const scene of scenes) {
                const percent = Math.round((completed / scenes.length) * 100);
                await JobService.updateProgress(jobId, percent, `Generating Voiceover ${scene.sequence_order}/${scenes.length}...`);
                
                // Only generate if there is text
                if (scene.audio_text && scene.audio_text.trim().length > 0) {
                    await AudioService.generateAudio(projectId, scene.id, scene.audio_text, userId, keys, model);
                }
                completed++;
            }
            await JobService.updateProgress(jobId, 100, 'Audio generated.');
        } catch (e: any) {
            console.error('Audio Gen failed:', e);
            await JobService.failJob(jobId, e.message);
        }
    })();

    return NextResponse.json({ success: true, jobId });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
