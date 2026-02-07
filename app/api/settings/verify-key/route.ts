import { NextResponse } from 'next/server'
import { ModelValidatorService } from '@/lib/services/model-validator'
import { supabaseAdmin } from '@/lib/supabaseServer'

export async function POST(req: Request) {
  try {
    const { provider, apiKey, userId } = await req.json()

    if (!apiKey) return NextResponse.json({ valid: false, error: 'No API Key' }, { status: 400 })

    // 1. Validate with the Provider
    let result;
    switch (provider) {
        case 'openai': result = await ModelValidatorService.validateOpenAI(apiKey); break;
        case 'google': result = await ModelValidatorService.validateGemini(apiKey); break;
        case 'anthropic': result = await ModelValidatorService.validateAnthropic(apiKey); break;
        default: return NextResponse.json({ valid: false, error: 'Unknown Provider' }, { status: 400 })
    }

    // 2. Handle DB Sync
    if (userId) {
        // Fetch current settings
        const { data: currentSettings } = await supabaseAdmin
            .from('user_settings')
            .select('available_models')
            .eq('user_id', userId)
            .single();
        
        const existingModels = currentSettings?.available_models || {};
        let updatedModels = { ...existingModels };

        if (result.valid) {
            // SUCCESS: Update with new models
            updatedModels[provider] = result.models;
        } else {
            // FAILURE: WIPE existing models for this provider
            // This fixes the issue where old "garbage" stays after a failed test
            console.log(`Validation failed for ${provider}. Wiping cached models.`);
            updatedModels[provider] = []; 
        }

        // Save to DB
        await supabaseAdmin
            .from('user_settings')
            .update({ available_models: updatedModels })
            .eq('user_id', userId);
    }

    // Return the result (even if failed, so frontend can show toast)
    return NextResponse.json(result)

  } catch (error: any) {
    return NextResponse.json({ valid: false, error: error.message }, { status: 500 })
  }
}
