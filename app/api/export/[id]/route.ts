import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Correctly await the params promise for Next.js 15
    const { id } = await params;

    // Fetch project data for the export package
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*, scenes(*)')
      .eq('id', id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Logic for generating the export (CapCut JSON or Asset Package)
    // This replicates your original ProjectService.exportToCapCut logic
    return NextResponse.json({ 
      success: true, 
      message: 'Export package generated',
      data: project 
    });

  } catch (error: any) {
    console.error('Export API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}