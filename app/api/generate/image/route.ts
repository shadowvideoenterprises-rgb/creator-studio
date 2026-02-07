import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { supabaseAdmin } from '@/lib/supabaseServer'

export async function POST(req: Request) {
  try {
    const { projectId, prompt, type = 'thumbnail' } = await req.json()
    if (!projectId) return NextResponse.json({ error: 'No Project ID' }, { status: 400 })

    const { data: project } = await supabaseAdmin.from('projects').select('user_id').eq('id', projectId).single()
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    const { data: settings } = await supabaseAdmin.from('user_settings').select('api_keys').eq('user_id', project.user_id).single()
    const keys = settings?.api_keys || {}
    
    let finalImageUrl = ''
    let providerUsed = 'unknown'

    // --- ATTEMPT 1: GOOGLE (Force the Apps Script Model) ---
    if (keys.google) {
        try {
            console.log("Attempting Google Imagen 4.0 (Hardcoded)...")
            // This is the EXACT model ID from your working "Studio Creator Code 36.0.txt"
            const modelId = 'imagen-4.0-generate-001'
            
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelId}:predict?key=${keys.google}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    instances: [{ prompt: `High quality YouTube thumbnail, ${prompt}` }],
                    parameters: { aspectRatio: "16:9", sampleCount: 1 }
                })
            })

            const data = await response.json()
            
            // Log the error if it fails so we know why
            if (data.error) console.warn("Google 4.0 Error:", data.error.message)
            
            if (data.predictions?.[0]?.bytesBase64Encoded) {
                finalImageUrl = `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`
                providerUsed = 'google-imagen-4.0'
            }
        } catch (e) { console.warn("Google 4.0 Failed") }
    }

    // --- ATTEMPT 2: GOOGLE (Stable Backup) ---
    if (!finalImageUrl && keys.google) {
        try {
            console.log("Attempting Google Imagen 3.0 (Backup)...")
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${keys.google}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    instances: [{ prompt: `High quality YouTube thumbnail, ${prompt}` }],
                    parameters: { aspectRatio: "16:9", sampleCount: 1 }
                })
            })
            const data = await response.json()
            if (data.predictions?.[0]?.bytesBase64Encoded) {
                finalImageUrl = `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`
                providerUsed = 'google-imagen-3.0'
            }
        } catch (e) { console.warn("Google 3.0 Failed") }
    }

    // --- ATTEMPT 3: POLLINATIONS (Free AI) ---
    if (!finalImageUrl) {
        console.log("Using Pollinations AI...")
        const safePrompt = encodeURIComponent(prompt.substring(0, 80)) // Keep it short for URL stability
        const seed = Math.floor(Math.random() * 9999)
        finalImageUrl = `https://image.pollinations.ai/prompt/${safePrompt}?nologo=true&private=true&seed=${seed}`
        providerUsed = 'pollinations-ai'
    }

    // --- ATTEMPT 4: THE SAFETY NET (Guaranteed Placeholder) ---
    // If Pollinations returns a 404 or broken link, the UI might break. 
    // We can't detect a client-side broken link here, but we can ensure we have a valid URL string.
    if (!finalImageUrl) {
         finalImageUrl = `https://placehold.co/1280x720/121214/purple?text=${encodeURIComponent(type)}`
         providerUsed = 'safety-net'
    }

    // Save to Database
    if (type === 'thumbnail') {
        await supabaseAdmin.from('projects').update({ thumbnail_url: finalImageUrl }).eq('id', projectId)
    }

    return NextResponse.json({ success: true, url: finalImageUrl, provider: providerUsed })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
