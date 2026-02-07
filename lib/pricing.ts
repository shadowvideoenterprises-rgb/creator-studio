export const PRICING = {
  // Costs per 1k tokens / or per unit
  google: {
    'gemini-2.0-flash': { input: 0.0001, output: 0.0004 }, // $0.10 / 1M input
    'gemini-1.5-pro': { input: 0.0035, output: 0.0105 },
    'imagen-3.0': 0.04 // $0.04 per image
  },
  elevenlabs: {
    'standard': 0.0003 // ~$0.30 per 1000 chars
  }
}

export const calculateCost = (provider: string, model: string, usage: { input?: number, output?: number, count?: number }) => {
  let cost = 0;
  
  if (provider === 'google') {
    if (model.includes('imagen')) {
        cost = (usage.count || 1) * PRICING.google['imagen-3.0'];
    } else {
        // Text Models
        const rates = model.includes('pro') ? PRICING.google['gemini-1.5-pro'] : PRICING.google['gemini-2.0-flash'];
        cost += ((usage.input || 0) / 1000) * rates.input;
        cost += ((usage.output || 0) / 1000) * rates.output;
    }
  }
  
  if (provider === 'elevenlabs') {
      cost = ((usage.count || 0) / 1000) * PRICING.elevenlabs.standard;
  }

  return parseFloat(cost.toFixed(6)); // Return as number with 6 decimals
}
