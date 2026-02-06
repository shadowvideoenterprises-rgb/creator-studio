import { NextResponse } from 'next/server'
import { BatchService } from '@/lib/services/batch.service'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const { projectId } = await req.json()
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fire and forget (Background process)
  BatchService.processAllScenes(projectId, user.id)

  return NextResponse.json({ success: true, message: 'Batch process started' })
}