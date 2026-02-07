import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { JobService } from '@/lib/services/job.service'
import { AudioService } from '@/lib/services/audioService'
import { CreditService } from '@/lib/services/creditService'

export async function POST(req: Request) {
  try {
    const { projectId, userId } = await req.json();

    // 1. Get Scenes
    const { data: scenes } = await supabaseAdmin.from('scenes').select('*').eq('project_id', projectId)
    if (!scenes || scenes.length === 0) return NextResponse.json({ error: 'No scenes' }, { status: 404 })

    // 2. Estimate Cost (2 credits per scene)
    const estimatedCost = scenes.length * 2
    
    // 3. PAYMENT CHECK
    const canPay = await CreditService.charge(userId, estimatedCost, `Audio Batch (${scenes.length} scenes)`)
    if (!canPay) return NextResponse.json({ error: `Insufficient Credits. Need ${estimatedCost}.` }, { status: 402 })

    // 4. Start Job
    const { data: settings } = await supabaseAdmin.from('user_settings').select('*').eq('user_id', userId).single()
    const jobId = await JobService.createJob(userId, 'audio_gen')

    (async () => {
        try {
            let completed = 0;
            for (const scene of scenes) {
                await JobService.updateProgress(jobId, Math.round((completed / scenes.length) * 100), `Voicing Scene ${scene.sequence_order}...`)
                if (scene.audio_text) {
                    const result = await AudioService.generateVoiceover(scene.audio_text, settings)
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
            await JobService.updateProgress(jobId, 100, 'Audio generated.')
        } catch (e: any) {
            await JobService.failJob(jobId, e.message)
        }
    })();

    return NextResponse.json({ success: true, jobId, cost: estimatedCost })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
