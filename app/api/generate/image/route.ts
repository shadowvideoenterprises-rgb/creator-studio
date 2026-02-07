import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { ImageService } from '@/lib/services/imageService'
import { CreditService } from '@/lib/services/creditService'
import { UsageTracker } from '@/lib/services/usageTracker'
import { AssetCache } from '@/lib/services/assetCache'
import { PromptEnhancer } from '@/lib/services/promptEnhancer'

export async function POST(req: Request) {
  try {
    const { projectId, prompt, type = 'thumbnail', enhance = true } = await req.json()
    if (!projectId) return NextResponse.json({ error: 'No Project ID' }, { status: 400 })

    const { data: project } = await supabaseAdmin.from('projects').select('user_id').eq('id', projectId).single()
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    // 1. Payment Check (5 Credits)
    const canPay = await CreditService.charge(project.user_id, 5, `Image Gen (${type})`)
    if (!canPay) return NextResponse.json({ error: "Insufficient Credits. Need 5." }, { status: 402 })

    const { data: settings } = await supabaseAdmin.from('user_settings').select('*').eq('user_id', project.user_id).single()
    const keys = settings?.api_keys || {}
    
    // 2. Model Selection
    let imageModelId = 'imagen-3.0-generate-001'
    if (settings?.available_models?.google) {
        const models = settings.available_models.google;
        const imageModel = models.find((m: any) => m.id.includes('imagen') || m.type === 'image');
        if (imageModel) imageModelId = imageModel.id;
    }
    
    // 3. PROMPT ENHANCEMENT (NEW)
    let finalPrompt = prompt;
    if (enhance && keys.google) {
        console.log(`Enhancing prompt: "${prompt}"...`);
        finalPrompt = await PromptEnhancer.enhance(prompt, keys.google);
        console.log(`Enhanced: "${finalPrompt}"`);
    }

    // 4. CACHE CHECK (With Enhanced Prompt)
    const cachedUrl = await AssetCache.get(finalPrompt, 'image', imageModelId);
    
    let resultUrl = cachedUrl;
    let provider = 'cache';

    // 5. Generate (Only if no cache)
    if (!cachedUrl) {
        const result = await ImageService.generateImage(keys.google, finalPrompt, imageModelId)
        resultUrl = result.url;
        provider = result.provider;

        // 6. Save to Cache & Track Usage
        if (resultUrl) {
            await AssetCache.set(finalPrompt, 'image', resultUrl, imageModelId);
            await UsageTracker.track(project.user_id, 'image', imageModelId, { count: 1 })
        }
    }

    // 7. Save Project Thumbnail
    if (resultUrl && type === 'thumbnail') {
        await supabaseAdmin.from('projects').update({ thumbnail_url: resultUrl }).eq('id', projectId)
    }

    // Return the ENHANCED prompt so the UI can update
    return NextResponse.json({ 
        success: true, 
        url: resultUrl, 
        provider: provider, 
        model: imageModelId, 
        cached: !!cachedUrl,
        enhancedPrompt: finalPrompt 
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
