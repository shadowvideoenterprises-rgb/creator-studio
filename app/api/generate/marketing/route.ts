import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { MarketingService } from '@/lib/services/marketingService'

export async function POST(req: Request) {
  try {
    const { projectId } = await req.json()

    if (!projectId) return NextResponse.json({ error: 'No Project ID' }, { status: 400 })

    // 1. Fetch Project & Script
    const { data: project } = await supabaseAdmin.from('projects').select('*').eq('id', projectId).single()
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    const { data: scenes } = await supabaseAdmin
        .from('scenes')
        .select('audio_text, visual_description')
        .eq('project_id', projectId)
        .order('sequence_order')

    // Combine scenes into a readable script for the AI
    const fullScript = scenes?.map(s => `[Visual: ${s.visual_description}] Audio: ${s.audio_text}`).join('\n') || ""

    // 2. Fetch Keys
    const { data: settings } = await supabaseAdmin.from('user_settings').select('api_keys').eq('user_id', project.user_id).single()
    const keys = settings?.api_keys || {}

    if (!keys.google) return NextResponse.json({ error: 'No Google Key found for marketing gen' }, { status: 400 })

    // 3. Generate Package
    const marketingData = await MarketingService.generatePackage(keys.google, fullScript, project.title)

    // 4. Save to Database
    // We update the project title to the optimized one, and store the rest in a new column (or description)
    // For this version, we will update the main fields so they appear on the Launch Page.
    const { error } = await supabaseAdmin
        .from('projects')
        .update({
            title: marketingData.title,
            description: marketingData.description,
            // If you have a tags column, save it there. Otherwise we append to description or handle elsewhere.
            // marketing_data: marketingData // Ideal if you add a JSONB column
        })
        .eq('id', projectId)

    if (error) throw error

    return NextResponse.json({ success: true, data: marketingData })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
