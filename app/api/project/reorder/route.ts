import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'

export async function POST(req: Request) {
  try {
    const { projectId, sceneId, newIndex } = await req.json()

    // 1. Fetch all scenes
    const { data: scenes } = await supabaseAdmin
      .from('scenes')
      .select('id, sequence_order')
      .eq('project_id', projectId)
      .order('sequence_order', { ascending: true })

    if (!scenes) throw new Error("No scenes found")

    // 2. Reorder in memory
    const oldIndex = scenes.findIndex(s => s.id === sceneId)
    if (oldIndex === -1) throw new Error("Scene not found")

    const [movedScene] = scenes.splice(oldIndex, 1)
    scenes.splice(newIndex, 0, movedScene)

    // 3. Prepare Bulk Update
    const updates = scenes.map((s, index) => ({
        id: s.id,
        project_id: projectId, // Required for upsert
        sequence_order: index + 1
    }))

    // 4. Save to DB
    const { error } = await supabaseAdmin.from('scenes').upsert(updates)
    if (error) throw error

    return NextResponse.json({ success: true })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
