import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { BatchService } from '@/lib/services/batchService'

// Note: Batch route was using JobService in older versions, 
// but based on Phase 9 code, it actually calls BatchService.
// If it DOES use JobService, we fix the import here.
// For safety, we keep it clean.

export async function POST(req: Request) {
  try {
    const { action, projectId, payload } = await req.json()

    const { data: project } = await supabaseAdmin.from('projects').select('user_id').eq('id', projectId).single()
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    const { data: settings } = await supabaseAdmin.from('user_settings').select('api_keys').eq('user_id', project.user_id).single()
    const keys = settings?.api_keys || {}

    if (action === 'update_style') {
        if (!keys.google) return NextResponse.json({ error: 'No Google Key' }, { status: 400 })
        await BatchService.updateVisuals(projectId, payload.style, keys.google)
        return NextResponse.json({ success: true, message: "Styles updated." })
    }

    if (action === 'swap_voice') {
        await BatchService.updateAudio(projectId, project.user_id, payload.voiceId)
        return NextResponse.json({ success: true, message: "Voice updated." })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
