import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { ModelDiscoveryService } from '@/lib/services/modelDiscovery';

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    // 1. Fetch Keys
    const { data: settings } = await supabaseAdmin
      .from('user_settings')
      .select('api_keys')
      .eq('user_id', userId)
      .single();

    if (!settings?.api_keys) {
      return NextResponse.json({ error: 'No API keys found' }, { status: 404 });
    }

    // 2. Scan
    const discoveredModels = await ModelDiscoveryService.scanAll(settings.api_keys);

    // 3. Save
    const { error } = await supabaseAdmin
      .from('user_settings')
      .update({
        available_models: discoveredModels,
        models_last_scanned: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true, models: discoveredModels });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
