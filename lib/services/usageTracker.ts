import { supabaseAdmin } from '@/lib/supabaseServer'
import { calculateCost } from '@/lib/pricing'

export class UsageTracker {
  
  static async track(userId: string, operation: string, model: string, stats: { input?: number, output?: number, count?: number }) {
    try {
        // 1. Calculate Cost
        const provider = model.includes('gemini') || model.includes('imagen') ? 'google' : 'elevenlabs';
        const cost = calculateCost(provider, model, stats);

        // 2. Log Entry
        await supabaseAdmin.from('usage_logs').insert({
            user_id: userId,
            operation,
            model,
            cost,
            tokens: (stats.input || 0) + (stats.output || 0),
            metadata: stats
        });

        // 3. Update Total Spend (Atomic Increment)
        // Note: Supabase doesn't have a clean "increment" via JS client without RPC, 
        // so we fetch-then-update (or use a stored procedure in production).
        // For MVP, fetch-update is fine.
        const { data: current } = await supabaseAdmin.from('user_settings').select('total_spend').eq('user_id', userId).single();
        const newTotal = (current?.total_spend || 0) + cost;
        
        await supabaseAdmin.from('user_settings').update({ total_spend: newTotal }).eq('user_id', userId);

        return cost;
    } catch (error) {
        console.error("Usage Tracking Failed:", error);
        return 0;
    }
  }
}
