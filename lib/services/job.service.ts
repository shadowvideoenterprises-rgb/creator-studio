import { supabaseAdmin } from '@/lib/supabaseServer'
import { Job } from '@/lib/types'

export class JobService {
  static async createJob(userId: string, type: Job['type']): Promise<string> {
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .insert({
        user_id: userId,
        type,
        status: 'pending',
        progress: 0,
        message: 'Job initialized...'
      })
      .select('id')
      .single()

    if (error) throw new Error(`Failed to create job: ${error.message}`)
    return data.id
  }

  static async updateProgress(jobId: string, progress: number, message: string) {
    await supabaseAdmin
      .from('jobs')
      .update({
        progress,
        message,
        status: progress === 100 ? 'completed' : 'running',
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId)
  }

  static async failJob(jobId: string, error: string) {
    await supabaseAdmin
      .from('jobs')
      .update({
        status: 'failed',
        error,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId)
  }
}