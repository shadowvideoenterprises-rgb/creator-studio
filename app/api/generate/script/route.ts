import { NextResponse } from 'next/server';
import { AIService } from '@/lib/services/ai.service';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    
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