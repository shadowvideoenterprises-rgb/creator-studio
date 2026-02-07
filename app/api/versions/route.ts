import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { VersionService } from '@/lib/services/versionService'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  // Get list of versions
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');
  
  if (!projectId) return NextResponse.json({ error: 'No Project ID' }, { status: 400 });

  const { data } = await supabaseAdmin
    .from('project_versions')
    .select('id, label, created_at')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  return NextResponse.json({ success: true, versions: data });
}

export async function POST(req: Request) {
  // Handle Create or Restore
  try {
    const { action, projectId, versionId, userId, label } = await req.json();

    if (action === 'save') {
        const success = await VersionService.createSnapshot(projectId, userId, label || 'Manual Save');
        return NextResponse.json({ success });
    }

    if (action === 'restore') {
        const success = await VersionService.restoreSnapshot(versionId);
        return NextResponse.json({ success });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
