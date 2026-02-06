import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/lib/supabaseClient";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export class AIService {
  /**
   * Generates a full video script and saves individual scenes to the DB.
   * Reports real-time progress for the UI loading state.
   */
  static async writeScript(projectId: string, title: string, context: string, userId: string) {
    const jobId = crypto.randomUUID();
    
    try {
      // 1. Initialize Progress
      await this.updateJobProgress(jobId, 10, "Analyzing project scope...", userId);

      // 2. Call Gemini 2.5 Flash
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 
      
      const prompt = `
        You are an expert viral video scriptwriter. Create a scene-by-scene script for: "${title}".
        Context: ${context}
        Return ONLY a JSON array of objects with these fields:
        "sequence_order" (number), "audio_text" (string), "visual_description" (string).
      `;

      await this.updateJobProgress(jobId, 40, "Gemini is drafting your scenes...", userId);
      const result = await model.generateContent(prompt);
      const scenesText = result.response.text().replace(/```json|```/g, "").trim();
      const scenes = JSON.parse(scenesText);

      // 3. Relational Save to Supabase
      await this.updateJobProgress(jobId, 70, "Saving scenes to workspace...", userId);
      
      const formattedScenes = scenes.map((scene: any) => ({
        project_id: projectId,
        sequence_order: scene.sequence_order,
        audio_text: scene.audio_text,
        visual_description: scene.visual_description,
      }));

      const { error: sceneError } = await supabase.from('scenes').insert(formattedScenes);
      if (sceneError) throw sceneError;

      // 4. Update Project Status
      const { error: projectError } = await supabase
        .from('projects')
        .update({ status: 'script' })
        .eq('id', projectId);
      if (projectError) throw projectError;

      await this.updateJobProgress(jobId, 100, "Script finalized!", userId, "completed");
      return { success: true, jobId };

    } catch (error: any) {
      console.error("AIService Error:", error);
      await this.updateJobProgress(jobId, 0, `Error: ${error.message}`, userId, "failed");
      throw error;
    }
  }

  private static async updateJobProgress(
    jobId: string, 
    progress: number, 
    message: string, 
    userId: string, 
    status: 'pending' | 'processing' | 'completed' | 'failed' = 'processing'
  ) {
    await supabase.from('job_progress').upsert({
      job_id: jobId,
      user_id: userId,
      progress,
      message,
      status,
      updated_at: new Date()
    }, { onConflict: 'job_id' });
  }
}