import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { AudioService } from '@/lib/services/audioService'
import { CreditService } from '@/lib/services/creditService'
import { UsageTracker } from '@/lib/services/usageTracker'

export async function POST(req: Request) {
  try {
    const { projectId, userId } = await req.json();

    // 1. Validation
    const { data: scenes } = await supabaseAdmin.from('scenes').select('*').eq('project_id', projectId)
    if (!scenes || scenes.length === 0) return NextResponse.json({ error: 'No scenes' }, { status: 404 })

    const estimatedCost = scenes.length * 2
    
    // 2. Payment
    const canPay = await CreditService.charge(userId, estimatedCost, `Audio Batch (${scenes.length} scenes)`)
    if (!canPay) return NextResponse.json({ error: `Insufficient Credits. Need ${estimatedCost}.` }, { status: 402 })

    // 3. Create Job (Inlined)
    let jobId = "mock-" + Date.now();
    try {
        const { data: jobData, error: jobError } = await supabaseAdmin.from('jobs').insert({
          user_id: userId,
          type: 'audio_gen',
          status: 'processing',
          progress: 0,
          message: 'Starting...'
        }).select('id').single();
        if (!jobError && jobData) jobId = jobData.id;
    } catch (e) { console.error("Job Creation Failed", e) }

    // 4. Start Background Process
    const { data: settings } = await supabaseAdmin.from('user_settings').select('*').eq('user_id', userId).single();
    
    (async () => {
        try {
            let completed = 0;
            for (const scene of scenes) {
                // Update Progress
                if (!jobId.startsWith('mock-')) {
                    const pct = Math.round((completed / scenes.length) * 100);
                    await supabaseAdmin.from('jobs').update({
                        progress: pct,
                        message: `Voicing Scene ${scene.sequence_order}...`,
                        status: 'processing'
                    }).eq('id', jobId);
                }

                if (scene.audio_text) {
                    const result = await AudioService.generateVoiceover(scene.audio_text, settings)
                    
                    // TRACK USAGE (NEW)
                    await UsageTracker.track(userId, 'audio', 'eleven_multilingual_v2', { 
                        count: scene.audio_text.length 
                    })

                    await supabaseAdmin.from('scene_assets').insert({
                        project_id: projectId,
                        scene_id: scene.id,
                        asset_type: 'audio',
                        asset_url: result.audioData, 
                        provider: result.provider
                    })
                }
                completed++;
            }
            
            // Finish Job
             if (!jobId.startsWith('mock-')) {
                await supabaseAdmin.from('jobs').update({
                    progress: 100,
                    message: 'Audio generated.',
                    status: 'completed'
                }).eq('id', jobId);
            }

        } catch (e: any) {
             if (!jobId.startsWith('mock-')) {
                await supabaseAdmin.from('jobs').update({ status: 'failed', message: e.message }).eq('id', jobId);
            }
        }
    })();

    return NextResponse.json({ success: true, jobId, cost: estimatedCost })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
