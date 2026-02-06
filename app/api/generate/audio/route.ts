import { NextResponse } from 'next/server'
import { BatchService } from '@/lib/services/batch.service'

export async function POST(req: Request) {
  try {
    const { projectId, userId } = await req.json();

    if (!projectId || !userId) {
      return NextResponse.json({ error: 'Missing projectId or userId' }, { status: 400 });
    }

    // Trigger the Audio Batch
    const jobId = await BatchService.processAudioBatch(projectId, userId);

    return NextResponse.json({ 
      success: true, 
      jobId,
      message: 'Audio generation started' 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}