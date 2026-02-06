import { NextResponse } from 'next/server'
import { ScriptService } from '@/lib/services/script.service'
import { JobService } from '@/lib/services/job.service'

export async function POST(req: Request) {
  try {
    const { projectId, title, context, userId, keys, model } = await req.json();

    if (!projectId || !userId) {
      return NextResponse.json({ error: 'Missing projectId or userId' }, { status: 400 });
    }

    const jobId = await JobService.createJob(userId, 'script_gen');

    (async () => {
      try {
        await JobService.updateProgress(jobId, 10, `Initializing ${model || 'Free'} Engine...`);
        // We now pass the specific model selected by the user
        await ScriptService.generateScript(projectId, title, context, keys, model);
        await JobService.updateProgress(jobId, 100, 'Script generated.');
      } catch (error: any) {
        console.error('Script Gen Failed:', error);
        await JobService.failJob(jobId, error.message);
      }
    })();

    return NextResponse.json({ success: true, jobId, message: 'Started' });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
