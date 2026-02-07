import { supabaseAdmin } from '../supabaseServer'
import OpenAI from 'openai'

export class ImageService {

  static async generateSceneImage(sceneId: string, projectId: string, visualDescription: string, userKeys: any = {}, modelPreference: string = 'replicate-flux') {
    
    console.log(`🎨 Generating Image for Scene ${sceneId} using ${modelPreference}`);

    // 1. Fetch Channel DNA to apply "Visual Style"
    const { data: project } = await supabaseAdmin.from('projects').select('user_id').eq('id', projectId).single();
    let stylePrompt = "cinematic, 4k, high resolution"; 
    
    if (project?.user_id) {
        const { data: profile } = await supabaseAdmin.from('channel_profiles')
            .select('visual_style_prompt')
            .eq('user_id', project.user_id)
            .eq('is_active', true)
            .single();
        if (profile?.visual_style_prompt) stylePrompt = profile.visual_style_prompt;
    }

    const finalPrompt = `${visualDescription}. Style: ${stylePrompt}. No text, no words, photorealistic.`;
    let imageUrl = "";

    try {
        // --- PROVIDER: REPLICATE (FLUX) ---
        if (modelPreference.includes('replicate') && userKeys.replicate) {
            const response = await fetch("https://api.replicate.com/v1/predictions", {
                method: "POST",
                headers: {
                    Authorization: `Token ${userKeys.replicate}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    version: "bf5375862d9893d7c5791a87e50b691124671a534575d19f6a2761623838165d", 
                    input: { prompt: finalPrompt, aspect_ratio: "16:9" } 
                }),
            });
            
            let prediction = await response.json();
            if (prediction.error) throw new Error(prediction.error);

            while (prediction.status !== "succeeded" && prediction.status !== "failed") {
                await new Promise((r) => setTimeout(r, 1000)); 
                const statusRes = await fetch(prediction.urls.get, {
                    headers: { Authorization: `Token ${userKeys.replicate}` }
                });
                prediction = await statusRes.json();
            }

            if (prediction.status === "succeeded") {
                imageUrl = prediction.output[0];
            } else {
                throw new Error("Replicate generation failed");
            }
        } 
        
        // --- PROVIDER: OPENAI (DALL-E 3) ---
        else if (modelPreference.includes('dalle') && userKeys.openai) {
            const openai = new OpenAI({ apiKey: userKeys.openai });
            const response = await openai.images.generate({
                model: "dall-e-3",
                prompt: finalPrompt,
                n: 1,
                size: "1024x1024",
                quality: "standard",
            });
            
            // FIX: Check if data exists before accessing index 0
            if (response.data && response.data.length > 0) {
                imageUrl = response.data[0].url || "";
            }
        }
        
        // --- FALLBACK ---
        else {
             console.warn("No valid Image Provider found. Using placeholder.");
             imageUrl = `https://placehold.co/1920x1080/1a1a1a/FFF?text=${encodeURIComponent(visualDescription.substring(0,20))}`;
        }

        if (imageUrl) {
            await supabaseAdmin.from('scenes').update({
                image_url: imageUrl,
                image_prompt: finalPrompt,
                image_provider: modelPreference
            }).eq('id', sceneId);
        }

        return imageUrl;

    } catch (error: any) {
        console.error("Image Gen Error:", error);
        throw error;
    }
  }
}
