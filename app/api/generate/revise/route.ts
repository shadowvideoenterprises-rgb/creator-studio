import { NextResponse } from 'next/server'
import { ScriptService } from '@/lib/services/script.service'
import { supabaseAdmin } from '@/lib/supabaseServer'

export async function POST(req: Request) {
  try {
    const { projectId, instruction, model } = await req.json()

    if (!projectId || !instruction) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

    // 1. Validate Project
    const { data: project } = await supabaseAdmin.from('projects').select('user_id').eq('id', projectId).single()
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    // 2. Fetch API Keys from User Settings
    const { data: settings } = await supabaseAdmin.from('user_settings').select('api_keys').eq('user_id', project.user_id).single()
    
    // Safely extract keys
    const userKeys = {
        openai: settings?.api_keys?.openai,
        gemini: settings?.api_keys?.google || process.env.GEMINI_API_KEY, 
        anthropic: settings?.api_keys?.anthropic
    }

    // 3. Fetch Current Scenes (We need context to revise it)
    const { data: currentScenes } = await supabaseAdmin
        .from('scenes')
        .select('*')
        .eq('project_id', projectId)
        .order('sequence_order')

    // 4. Call the Service
    const scenes = await ScriptService.reviseScript(
        projectId, 
        currentScenes || [], 
        instruction, 
        userKeys, 
        model
    )

    return NextResponse.json({ success: true, scenes })

  } catch (error: any) {
    console.error("Revision API Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
