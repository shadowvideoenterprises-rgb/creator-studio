import { NextResponse } from 'next/server'
import { BatchService } from '@/lib/services/batch.service'
import { supabase } from '@/lib/supabaseClient'

export async function POST(req: Request) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await req.json();

    // Fire and forget (Background process)
    BatchService.processAllScenes(projectId, user.id)

    return NextResponse.json({ success: true, message: 'Batch process started' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}