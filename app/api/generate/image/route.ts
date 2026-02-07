import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { ImageService } from '@/lib/services/imageService'

export async function POST(req: Request) {
  try {
    const { projectId, prompt, type = 'thumbnail' } = await req.json()
    if (!projectId) return NextResponse.json({ error: 'No Project ID' }, { status: 400 })

    // 1. Get Project & Settings
    const { data: project } = await supabaseAdmin.from('projects').select('user_id').eq('id', projectId).single()
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    const { data: settings } = await supabaseAdmin.from('user_settings').select('*').eq('user_id', project.user_id).single()
    const keys = settings?.api_keys || {}
    
    // 2. SMART CACHE CHECK (Roadmap Item 3.1)
    // If we already made this image for this project, just return it.
    // (Skipped for now to ensure we always generate fresh for this demo, 
    // but the Service method exists for when you enable the DB table).
    // const cached = await ImageService.getCachedImage(projectId, prompt);
    // if (cached) return NextResponse.json({ success: true, url: cached, provider: 'cache' });

    // 3. DYNAMIC MODEL SELECTION (Roadmap Item 1.1)
    // Look at the discovered models from Phase 1
    const availableModels = settings?.available_models?.google || []
    
    // Find the best image model available to the user
    const imageModel = availableModels.find((m: any) => m.type === 'image' && m.id.includes('generate')) 
        || { id: 'imagen-3.0-generate-001' } // Default Fallback

    // 4. GENERATE
    const result = await ImageService.generateImage(keys.google, prompt, imageModel.id)

    // 5. SAVE
    if (result.url && type === 'thumbnail') {
        await supabaseAdmin.from('projects').update({ thumbnail_url: result.url }).eq('id', projectId)
    }
    // Note: If type is 'scene', the frontend usually handles the saving, 
    // or we updates 'scenes' table here.

    return NextResponse.json({ success: true, url: result.url, provider: result.provider })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
