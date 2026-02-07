import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { BatchService } from '@/lib/services/batchService'

export async function POST(req: Request) {
  try {
    const { action, projectId, payload } = await req.json()

    // Auth check (simplified)
    const { data: project } = await supabaseAdmin.from('projects').select('user_id').eq('id', projectId).single()
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    const { data: settings } = await supabaseAdmin.from('user_settings').select('api_keys').eq('user_id', project.user_id).single()
    const keys = settings?.api_keys || {}

    if (action === 'update_style') {
        if (!keys.google) return NextResponse.json({ error: 'No Google Key' }, { status: 400 })
        await BatchService.updateVisuals(projectId, payload.style, keys.google)
        return NextResponse.json({ success: true, message: "Visual styles updated. Ready to regenerate." })
    }

    if (action === 'swap_voice') {
        await BatchService.updateAudio(projectId, project.user_id, payload.voiceId)
        return NextResponse.json({ success: true, message: "Voice setting updated. Ready to regenerate." })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
