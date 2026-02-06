import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { AIService } from '@/lib/services/ai.service';
import { JobService } from '@/lib/services/job.service';

export async function POST(req: Request) {
  try {
    // 1. Auth Check (Server-Side)
    const authHeader = req.headers.get('Authorization');
    // For simplicity in this phase, we trust the client sends the user ID or use session
    // In production, verify the session token here using supabaseAdmin.auth.getUser(token)
    
    // Quick parse for this example
    const { projectId, title, context, userId } = await req.json();

    if (!projectId || !title || !userId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // 2. Create the Job Entry synchronously
    const jobId = await JobService.createJob(userId, 'script_gen');

    // 3. Trigger the Long-Running Process (DO NOT AWAIT THIS)
    // We pass the jobId so the service can update the specific row
    (async () => {
      try {
        await AIService.writeScript(projectId, title, context, userId, jobId);
      } catch (err) {
        console.error("Background job failed:", err);
        await JobService.failJob(jobId, err instanceof Error ? err.message : 'Unknown error');
      }
    })();

    // 4. Return immediately to the client
    return NextResponse.json({ 
      success: true, 
      jobId, 
      message: 'Script generation started in background' 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}