import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { CreditService } from '@/lib/services/creditService'
import { UsageTracker } from '@/lib/services/usageTracker'
import { VersionService } from '@/lib/services/versionService'
import { JsonValidator } from '@/lib/utils/jsonValidator'
import { ChannelDnaService } from '@/lib/services/channelDna'

export async function POST(req: Request) {
  try {
    const { projectId, title } = await req.json()

    // 1. Setup
    const { data: project } = await supabaseAdmin.from('projects').select('*').eq('id', projectId).single()
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    const { data: settings } = await supabaseAdmin.from('user_settings').select('*').eq('user_id', project.user_id).single()
    const keys = settings?.api_keys || {}
    
    // 2. DNA Resolution
    const globalDna = settings?.channel_dna || ChannelDnaService.getDefault();
    const activeDna = project.channel_dna || globalDna;

    // 3. BRAND RESOLUTION (NEW)
    const channelName = settings?.channel_name || "My Channel";
    const intro = settings?.default_intro ? `MANDATORY INTRO: Start the script exactly with: "${settings.default_intro}"` : "";
    const outro = settings?.default_outro ? `MANDATORY OUTRO: End the script exactly with: "${settings.default_outro}"` : "";

    // 4. Payment
    if (!(await CreditService.charge(project.user_id, 10, `Script Gen: ${title.substring(0, 15)}...`))) {
        return NextResponse.json({ error: "Insufficient Credits" }, { status: 402 })
    }

    // 5. Model Selection
    let targetModel = 'gemini-2.0-flash'
    if (settings?.available_models?.google) {
        const m = settings.available_models.google.find((m: any) => m.id.includes('pro')) || settings.available_models.google[0];
        if (m) targetModel = m.id;
    }

    // 6. Generate
    const genAI = new GoogleGenerativeAI(keys.google)
    const aiModel = genAI.getGenerativeModel({ model: targetModel })

    const PROMPT = `
    You are the head writer for the YouTube channel "${channelName}".
    Write a script for: "${title}".
    
    ${ChannelDnaService.formatForPrompt(activeDna)}
    
    ${intro}
    ${outro}
    
    STRICT JSON OUTPUT ONLY.
    Structure: { "scenes": [ { "visual_description": "...", "audio_text": "...", "quality_score": 8, "visual_potential": 8 } ] }
    Make 6-10 scenes. Each scene 15-30 words.
    `

    const result = await aiModel.generateContent(PROMPT)
    const text = result.response.text()

    // 7. Validate
    const parsed = JsonValidator.parse(text, { scenes: [] });
    let scenes = parsed.scenes || [];
    if (scenes.length === 0) throw new Error("AI returned invalid JSON structure.");

    // 8. Track & Save
    const usage = result.response.usageMetadata || { promptTokenCount: 0, candidatesTokenCount: 0 }
    await UsageTracker.track(project.user_id, 'script', targetModel, { input: usage.promptTokenCount, output: usage.candidatesTokenCount })

    scenes = scenes.map((s: any, i: number) => ({
        ...s, 
        project_id: projectId, 
        sequence_order: i + 1, 
        estimated_duration: Math.ceil((s.audio_text?.split(/\s+/).length || 0) / 2.5)
    }))

    // Save Version (with DNA metadata)
    await VersionService.saveVersion(projectId, scenes, { model: targetModel, dna: activeDna });
    
    await supabaseAdmin.from('scenes').delete().eq('project_id', projectId)
    await supabaseAdmin.from('scenes').insert(scenes)

    return NextResponse.json({ success: true, count: scenes.length, dna_used: activeDna })

  } catch (error: any) {
    console.error("Script Gen Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
