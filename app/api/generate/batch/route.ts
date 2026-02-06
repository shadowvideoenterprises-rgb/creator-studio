import { NextResponse } from 'next/server'
import { BatchService } from '@/lib/services/batch.service'
import { supabaseAdmin } from '@/lib/supabaseServer'

export async function POST(req: Request) {
  try {
    // 1. Validate User (Server-side)
    // In production, use supabaseAdmin.auth.getUser(token)
    const { projectId, userId } = await req.json();

    if (!projectId || !userId) {
      return NextResponse.json({ error: 'Missing projectId or userId' }, { status: 400 });
    }

    // 2. Trigger the Batch Service
    // This now returns a Job ID immediately and runs the loop in the background
    const jobId = await BatchService.processAllScenes(projectId, userId);

    return NextResponse.json({ 
      success: true, 
      jobId,
      message: 'Batch asset generation started' 
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}