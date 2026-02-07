import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { ImageService } from '@/lib/services/imageService'
import { CreditService } from '@/lib/services/creditService'

export async function POST(req: Request) {
  try {
    const { projectId, prompt, type = 'thumbnail' } = await req.json()
    if (!projectId) return NextResponse.json({ error: 'No Project ID' }, { status: 400 })

    const { data: project } = await supabaseAdmin.from('projects').select('user_id').eq('id', projectId).single()
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    // PAYMENT CHECK (Cost: 5)
    const canPay = await CreditService.charge(project.user_id, 5, `Image Gen (${type})`)
    if (!canPay) return NextResponse.json({ error: "Insufficient Credits. Need 5." }, { status: 402 })

    const { data: settings } = await supabaseAdmin.from('user_settings').select('*').eq('user_id', project.user_id).single()
    const keys = settings?.api_keys || {}
    
    // Generate
    const availableModels = settings?.available_models?.google || []
    const imageModel = availableModels.find((m: any) => m.type === 'image' && m.id.includes('generate')) || { id: 'imagen-3.0-generate-001' }
    const result = await ImageService.generateImage(keys.google, prompt, imageModel.id)

    // Save
    if (result.url && type === 'thumbnail') {
        await supabaseAdmin.from('projects').update({ thumbnail_url: result.url }).eq('id', projectId)
    }

    return NextResponse.json({ success: true, url: result.url, provider: result.provider })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
