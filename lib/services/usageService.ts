import { supabaseAdmin } from '@/lib/supabaseServer';

export interface UsageLog {
  userId: string;
  projectId: string;
  provider: string; // 'google', 'openai', 'elevenlabs'
  model: string;
  type: 'text' | 'image' | 'audio';
  tokensInput?: number;
  tokensOutput?: number;
  cost: number;
}

export class UsageService {
  
  // PRICING TABLE (Ideally specific to your roadmap's "Cost Awareness" layer)
  private static PRICING: Record<string, any> = {
    'gemini-2.5-flash': { in: 0.0000001, out: 0.0000004 }, // ~$0.10 / 1M tokens
    'gemini-2.0-flash': { in: 0.0000001, out: 0.0000004 },
    'gemini-1.5-pro':   { in: 0.0000035, out: 0.0000105 },
    'gpt-4o':           { in: 0.0000050, out: 0.0000150 },
    'elevenlabs':       { char: 0.0003 }, // ~$0.30 per 1000 chars
    'imagen-3.0':       { image: 0.04 },  // ~$0.04 per image
    'dall-e-3':         { image: 0.04 }
  };

  static calculateCost(provider: string, model: string, usage: { input?: number, output?: number, count?: number }): number {
    const price = this.PRICING[model] || this.PRICING['gemini-2.0-flash']; // Safe default
    
    if (provider === 'elevenlabs') {
        return (usage.count || 0) * (this.PRICING['elevenlabs'].char);
    }
    
    if (provider.includes('image')) {
        return (usage.count || 1) * (price.image || 0.04);
    }

    // Text / LLM
    const inCost = (usage.input || 0) * (price.in || 0);
    const outCost = (usage.output || 0) * (price.out || 0);
    return inCost + outCost;
  }

  static async logUsage(log: UsageLog) {
    try {
        // Insert into 'usage_logs' table
        // Note: You need to create this table in Supabase SQL Editor if it doesn't exist
        /*
          create table usage_logs (
            id uuid default uuid_generate_v4() primary key,
            user_id uuid references auth.users,
            project_id uuid references projects,
            provider text,
            model text,
            cost float,
            created_at timestamp with time zone default now()
          );
        */
        const { error } = await supabaseAdmin.from('usage_logs').insert({
            user_id: log.userId,
            project_id: log.projectId,
            provider: log.provider,
            model: log.model,
            cost: log.cost,
            meta: { input: log.tokensInput, output: log.tokensOutput } // Optional JSONB for details
        });

        if (error) console.error("Failed to log usage:", error.message);
        
    } catch (e) {
        console.error("Usage logging error", e);
    }
  }
}
