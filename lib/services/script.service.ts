import { supabaseAdmin } from '../supabaseServer'
import { GoogleGenerativeAI } from '@google/generative-ai'
import OpenAI from 'openai'

// THE CLICHE BLACKLIST
const BANNED_WORDS = [
  "delve", "tapestry", "elevate", "unleash", "realm", 
  "game-changer", "cutting-edge", "landscape", "testament",
  "in conclusion", "fast forward", "treasure trove"
];

export class ScriptService {

  // --- GENERATE (CREATE NEW) ---
  static async generateScript(projectId: string, title: string, context: string, userKeys: any = {}, manualModel?: string) {
    // 1. Fetch Project
    const { data: project } = await supabaseAdmin.from('projects').select('user_id').eq('id', projectId).single();
    if (!project) throw new Error("Project not found");

    // 2. Determine Model
    let selectedModel: string = manualModel || '';
    if (!selectedModel) {
        const { data: settings } = await supabaseAdmin.from('user_settings').select('writing_model').eq('user_id', project.user_id).single();
        selectedModel = settings?.writing_model || 'gpt-4o';
    }
    
    console.log(`🧠 Script Gen using ENGINE: ${selectedModel} | Anti-Cliche: ON`);

    // 3. Context & DNA
    let brandVoice = '';
    let capcutStyle = false;
    let knowledgeContext = '';

    const { data: settings } = await supabaseAdmin.from('user_settings').select('export_preference').eq('user_id', project.user_id).single();
    if (settings) capcutStyle = settings.export_preference === 'capcut_chunks';

    const { data: profile } = await supabaseAdmin.from('channel_profiles').select('voice_tone').eq('user_id', project.user_id).eq('is_active', true).limit(1).single();
    if (profile) brandVoice = profile.voice_tone;

    const { data: knowledge } = await supabaseAdmin.from('project_knowledge').select('content, source_name').eq('project_id', projectId).eq('is_active', true);
    knowledgeContext = knowledge?.map((k: any) => `SOURCE (${k.source_name}): ${k.content}`).join('\n\n') || '';

    // 4. Prompt Construction
    let systemInstruction = `You are a viral video script writer. Generate a JSON response with an array of scenes.`;
    
    // INJECT ANTI-CLICHE RULES
    systemInstruction += `\n\n⛔ NEGATIVE PROMPTS (STRICTLY AVOID):
    - Do NOT use these words: ${BANNED_WORDS.join(", ")}.
    - Do NOT start sentences with "Imagine," "Picture this," or "In a world."
    - Do NOT use "Ladies and Gentlemen" or generic greetings.
    - If you are about to write "Delve," stop and use "Dig," "Explore," or "Look."`;

    if (capcutStyle) systemInstruction += `\nSTYLE: Fast-paced, high retention (TikTok). Short sentences.`;
    else systemInstruction += `\nSTYLE: Cinematic, documentary (YouTube). Conversational flow.`;
    
    if (brandVoice) systemInstruction += `\n\nCHANNEL VOICE: ${brandVoice}`;
    if (knowledgeContext) systemInstruction += `\n\nKNOWLEDGE WELL:\n${knowledgeContext}`;
    
    systemInstruction += `\nOutput Format: JSON object with a "scenes" array.`;

    let scenes = [];

    // 5. Execute
    if (selectedModel.includes('gpt') && userKeys.openai) {
        const openai = new OpenAI({ apiKey: userKeys.openai });
        const completion = await openai.chat.completions.create({
          messages: [{ role: "system", content: systemInstruction }, { role: "user", content: `Title: ${title}` }],
          model: selectedModel,
          response_format: { type: "json_object" },
        });
        const content = completion.choices[0].message.content;
        if (content) scenes = JSON.parse(content).scenes || [];
    } else {
        const genAI = new GoogleGenerativeAI(userKeys.gemini);
        const geminiModel = selectedModel.includes('gemini') ? selectedModel : "gemini-1.5-pro";
        const model = genAI.getGenerativeModel({ model: geminiModel }); 
        const result = await model.generateContent(systemInstruction + `\nTITLE: ${title}`);
        const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}') + 1;
        if (start !== -1) scenes = JSON.parse(text.substring(start, end)).scenes || [];
    }

    // 6. Save
    await supabaseAdmin.from('scenes').delete().eq('project_id', projectId);
    if (scenes.length > 0) {
        await supabaseAdmin.from('scenes').insert(scenes.map((s: any, i: number) => ({
            project_id: projectId, sequence_order: i + 1, visual_description: s.visual_description, audio_text: s.audio_text, status: 'draft'
        })));
    }
    return scenes;
  }

  // --- REVISE (EDIT EXISTING) ---
  static async reviseScript(projectId: string, currentScenes: any[], instruction: string, userKeys: any = {}, manualModel?: string) {
    const { data: project } = await supabaseAdmin.from('projects').select('user_id').eq('id', projectId).single();
    if (!project) throw new Error("Project not found");

    let selectedModel: string = manualModel || '';
    if (!selectedModel) {
        const { data: settings } = await supabaseAdmin.from('user_settings').select('writing_model').eq('user_id', project.user_id).single();
        selectedModel = settings?.writing_model || 'gpt-4o';
    }
    
    const prompt = `
      ROLE: Editor. 
      TASK: Revise the script scenes based on: "${instruction}".
      CONSTRAINT: Do NOT use these cliche words: ${BANNED_WORDS.join(", ")}.
      OUTPUT: JSON object with "scenes" array.
      
      CURRENT SCRIPT:
      ${JSON.stringify(currentScenes.map(s => ({ seq: s.sequence_order, visuals: s.visual_description, audio: s.audio_text })))}
    `;

    let revisedScenes = [];

    // Execute
    if (selectedModel.includes('gpt') && userKeys.openai) {
        const openai = new OpenAI({ apiKey: userKeys.openai });
        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: prompt }],
            model: selectedModel,
            response_format: { type: "json_object" }
        });
        const content = completion.choices[0].message.content;
        if (content) revisedScenes = JSON.parse(content).scenes || [];
    } else {
        const genAI = new GoogleGenerativeAI(userKeys.gemini);
        const geminiModel = selectedModel.includes('gemini') ? selectedModel : "gemini-1.5-pro";
        const model = genAI.getGenerativeModel({ model: geminiModel }); 
        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}') + 1;
        if (start !== -1) revisedScenes = JSON.parse(text.substring(start, end)).scenes || [];
    }

    // Save
    if (revisedScenes.length > 0) {
        await supabaseAdmin.from('scenes').delete().eq('project_id', projectId);
        await supabaseAdmin.from('scenes').insert(revisedScenes.map((s: any, i: number) => ({
            project_id: projectId, sequence_order: i + 1, visual_description: s.visuals || s.visual_description, audio_text: s.audio || s.audio_text, status: 'revised'
        })));
    }
    return revisedScenes;
  }
}
