import { NextResponse } from 'next/server'
import { ImageService } from '@/lib/services/image.service'
import { supabaseAdmin } from '@/lib/supabaseServer'

export async function POST(req: Request) {
  try {
    const { projectId, sceneId, model } = await req.json()

    if (!projectId) return NextResponse.json({ error: 'Project ID required' }, { status: 400 })

    // 1. Fetch Project
    const { data: project } = await supabaseAdmin.from('projects').select('user_id').eq('id', projectId).single()
    
    // FIX: Explicitly check if project exists before using it
    if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // 2. Fetch Settings
    const { data: settings } = await supabaseAdmin.from('user_settings').select('api_keys, default_image_model').eq('user_id', project.user_id).single()
    
    const userKeys = {
        replicate: settings?.api_keys?.replicate,
        openai: settings?.api_keys?.openai,
    }
    const selectedModel = model || settings?.default_image_model || 'replicate-flux'

    // 3. Fetch Scenes
    let scenesToProcess = [];
    if (sceneId) {
        const { data } = await supabaseAdmin.from('scenes').select('*').eq('id', sceneId).single();
        if (data) scenesToProcess.push(data);
    } else {
        const { data } = await supabaseAdmin.from('scenes').select('*').eq('project_id', projectId).is('image_url', null); 
        scenesToProcess = data || [];
    }

    // 4. Process Images
    const results = [];
    for (const scene of scenesToProcess) {
        if (!scene.visual_description) continue;
        try {
            const url = await ImageService.generateSceneImage(scene.id, projectId, scene.visual_description, userKeys, selectedModel);
            results.push({ id: scene.id, url });
        } catch (e: any) {
            console.error(`Failed to generate image for scene ${scene.id}:`, e);
            results.push({ id: scene.id, error: e.message });
        }
    }

    return NextResponse.json({ success: true, results })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
