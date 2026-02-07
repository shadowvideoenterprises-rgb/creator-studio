import { supabaseAdmin } from '@/lib/supabaseServer'

export async function createJob(userId: string, type: string): Promise<string> {
  try {
    // Attempt to create job
    const { data, error } = await supabaseAdmin.from('jobs').insert({
      user_id: userId,
      type: type,
      status: 'processing',
      progress: 0,
      message: 'Starting...'
    }).select('id').single();

    if (error) {
       // Silent fail to mock ID if table missing
       return "mock-" + Date.now();
    }
    return data.id;
  } catch (e) {
    return "mock-" + Date.now();
  }
}

export async function updateProgress(jobId: string, progress: number, message: string) {
  if (jobId.startsWith('mock-')) return;
  try {
    await supabaseAdmin.from('jobs').update({
        progress,
        message,
        status: progress === 100 ? 'completed' : 'processing'
    }).eq('id', jobId);
  } catch (e) { /* ignore */ }
}

export async function failJob(jobId: string, error: string) {
  if (jobId.startsWith('mock-')) return;
  try {
    await supabaseAdmin.from('jobs').update({
        status: 'failed',
        message: error
    }).eq('id', jobId);
  } catch (e) { /* ignore */ }
}
