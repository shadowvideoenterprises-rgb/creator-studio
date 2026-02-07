import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

  const { data } = await supabaseAdmin.from('dna_library').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return NextResponse.json({ library: data || [] });
}

export async function POST(req: Request) {
  try {
    const { userId, name, dna } = await req.json();
    
    // Save to Library
    const { data, error } = await supabaseAdmin.from('dna_library').insert({
        user_id: userId,
        name: name,
        dna_profile: dna
    }).select().single();

    if (error) throw error;
    return NextResponse.json({ success: true, entry: data });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await supabaseAdmin.from('dna_library').delete().eq('id', id);
    return NextResponse.json({ success: true });
}
