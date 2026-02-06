import { supabase } from '@/lib/supabaseClient'
import { MediaService } from './media.service'
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export class BatchService {
  static async processAllScenes(projectId: string, userId: string) {
    const jobId = crypto.randomUUID()
    
    try {
      // 1. Fetch all scenes missing assets
      const { data: scenes } = await supabase
        .from('scenes')
        .select('*')
        .eq('project_id', projectId)
        .order('sequence_order', { ascending: true })

      if (!scenes) return

      const total = scenes.length
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

      for (let i = 0; i < total; i++) {
        const scene = scenes[i]
        const progress = Math.round(((i + 1) / total) * 100)
        
        await this.updateProgress(jobId, progress, `Processing Scene ${scene.sequence_order}...`, userId)

        // Generate a visual search query if none exists
        const prompt = `Based on this script: "${scene.audio_text}", give me a 3-word search term for a stock photo. Return ONLY the words.`
        const result = await model.generateContent(prompt)
        const searchQuery = result.response.text().trim()

        // Auto-search and attach first result
        const media = await MediaService.searchPexels(searchQuery)
        if (media.length > 0) {
          await MediaService.attachAssetToScene(scene.id, media[0].url, 'pexels')
        }
      }

      await this.updateProgress(jobId, 100, "All assets generated!", userId, "completed")
    } catch (e: any) {
      await this.updateProgress(jobId, 0, `Batch Failed: ${e.message}`, userId, "failed")
    }
  }

  private static async updateProgress(jobId: string, progress: number, message: string, userId: string, status = 'processing') {
    await supabase.from('job_progress').upsert({
      job_id: jobId,
      user_id: userId,
      progress,
      message,
      status,
      updated_at: new Date()
    }, { onConflict: 'job_id' })
  }
}