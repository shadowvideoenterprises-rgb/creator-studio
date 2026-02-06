import { NextResponse } from 'next/server';
import { AIService } from '@/lib/services/ai.service';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    // Standardizing on the main client for reliability in Route Handlers
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, title, context } = await req.json();

    if (!projectId || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await AIService.writeScript(projectId, title, context, user.id);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}