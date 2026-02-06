import { GoogleGenerativeAI } from "@google/generative-ai"
import { supabaseAdmin } from '@/lib/supabaseServer'
import { withRetry } from '@/lib/utils/retry'
import { ScenesSchema } from '@/lib/validations/schemas'
import { JobService } from '@/lib/services/job.service'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export class AIService {
  static async writeScript(projectId: string, title: string, context: string, userId: string, jobId: string) {
    
    try {
      await JobService.updateProgress(jobId, 10, 'Brainstorming script structure...');

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
      const prompt = `Write a high-retention video script for "${title}". Context: ${context}. 
                      Return a JSON array of scenes with: sequence_order, audio_text, visual_description.`

      // AI Call with Retry
      const result = await withRetry(async () => {
        const aiResponse = await model.generateContent(prompt)
        return aiResponse.response.text()
      });

      await JobService.updateProgress(jobId, 50, 'Validating and formatting scenes...');

      // Schema Validation
      const rawJson = JSON.parse(result.replace(/```json|```/g, "").trim());
      const validatedScenes = ScenesSchema.parse(rawJson);

      // Batch Save
      const scenesToInsert = validatedScenes.map(scene => ({
        ...scene,
        project_id: projectId
      }));

      // Use Admin Client to bypass RLS for writing
      await supabaseAdmin.from('scenes').delete().eq('project_id', projectId);
      await supabaseAdmin.from('scenes').insert(scenesToInsert);

      await JobService.updateProgress(jobId, 100, 'Script generation complete.');

    } catch (error: any) {
      await JobService.failJob(jobId, error.message);
      throw error; // Re-throw to be caught by the route handler log
    }
  }
}