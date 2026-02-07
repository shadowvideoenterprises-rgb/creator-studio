import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'
import JSZip from 'jszip'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) return NextResponse.json({ error: 'No Project ID' }, { status: 400 })

    // 1. Fetch Project & Scenes
    const { data: project } = await supabaseAdmin.from('projects').select('*').eq('id', projectId).single()
    const { data: scenes } = await supabaseAdmin.from('scenes').select('*').eq('project_id', projectId).order('sequence_order')
    const { data: assets } = await supabaseAdmin.from('scene_assets').select('*').eq('project_id', projectId) // If you use a separate table

    if (!project || !scenes) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    const zip = new JSZip()
    const folder = zip.folder(project.title.replace(/[^a-z0-9]/gi, '_').substring(0, 50))

    // 2. Add Script / Bible
    const scriptContent = scenes.map(s => 
        `SCENE ${s.sequence_order}\n[Visual]: ${s.visual_description}\n[Audio]: ${s.audio_text}\n`
    ).join('\n\n')
    
    folder?.file('Script_Bible.txt', scriptContent)
    folder?.file('Project_Metadata.json', JSON.stringify(project, null, 2))

    // 3. Add Assets (Images & Audio)
    // We fetch the actual binary data from the URLs (assuming they are public or Base64)
    for (const scene of scenes) {
        const index = scene.sequence_order.toString().padStart(2, '0')
        
        // Add Image
        if (scene.image_url) {
            try {
                // Check if it's Base64 (Data URI) or a Web URL
                if (scene.image_url.startsWith('data:')) {
                    const base64Data = scene.image_url.split(',')[1]
                    folder?.file(`Scene_${index}_Visual.png`, base64Data, { base64: true })
                } else {
                    const response = await fetch(scene.image_url)
                    const buffer = await response.arrayBuffer()
                    folder?.file(`Scene_${index}_Visual.png`, buffer)
                }
            } catch (e) { console.error(`Failed to zip image for scene ${index}`) }
        }

        // Add Audio (Check scene_assets table or scene.audio_url if you stored it there)
        // For this demo, we check if we stored audio in the 'scene_assets' table or the 'scenes' table
        // Adjust logic to match your specific DB schema from Phase 4
        const audioAsset = assets?.find(a => a.scene_id === scene.id && a.asset_type === 'audio')
        
        if (audioAsset && audioAsset.asset_url) {
             try {
                if (audioAsset.asset_url.startsWith('data:')) {
                    const base64Data = audioAsset.asset_url.split(',')[1]
                    folder?.file(`Scene_${index}_Audio.mp3`, base64Data, { base64: true })
                } else {
                    const response = await fetch(audioAsset.asset_url)
                    const buffer = await response.arrayBuffer()
                    folder?.file(`Scene_${index}_Audio.mp3`, buffer)
                }
             } catch (e) { console.error(`Failed to zip audio for scene ${index}`) }
        }
    }

    // 4. Generate Zip Stream
    const zipContent = await zip.generateAsync({ type: 'blob' })
    
    // Convert Blob to Buffer for Next.js Response
    const arrayBuffer = await zipContent.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    return new NextResponse(buffer, {
        status: 200,
        headers: {
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename="${project.title}_Export.zip"`
        }
    })

  } catch (error: any) {
    console.error("Export Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
