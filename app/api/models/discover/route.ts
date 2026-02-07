import { NextResponse } from 'next/server';
import { ModelDiscoveryService } from '@/lib/services/modelDiscovery';
import { supabaseAdmin } from '@/lib/supabaseServer'; 

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: No User ID provided' }, { status: 401 });
    }

    // Get user's API keys from settings
    const { data: settings } = await supabaseAdmin
      .from('user_settings')
      .select('api_keys')
      .eq('user_id', userId)
      .single();

    const keys = settings?.api_keys || {};
    const discovery = new ModelDiscoveryService();
    const results: any = { google: [], openai: [] };

    // Discover Google models
    if (keys.google) {
      console.log("Scanning Google Models...");
      results.google = await discovery.discoverGoogleModels(keys.google);
    }

    // Store discovered models back into user settings
    await supabaseAdmin
      .from('user_settings')
      .update({
        available_models: results,
        models_last_scanned: new Date().toISOString(),
      })
      .eq('user_id', userId);

    return NextResponse.json({
      success: true,
      models: results,
      scannedAt: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Discovery error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
