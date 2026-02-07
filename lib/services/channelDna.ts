export interface ChannelDNA {
  audience: string;
  tone: string;
  style: string;
  pacing: string;
}

export class ChannelDnaService {
  
  static formatForPrompt(dna: ChannelDNA): string {
    return `
    CHANNEL DNA (STRICT ADHERENCE REQUIRED):
    - Target Audience: ${dna.audience}
    - Voice/Tone: ${dna.tone}
    - Visual Style: ${dna.style}
    - Pacing: ${dna.pacing}
    `;
  }

  static getDefault(): ChannelDNA {
    return {
      audience: "General Audience",
      tone: "Informative & Engaging",
      style: "High-Quality YouTube Documentary",
      pacing: "Moderate (150 wpm)"
    };
  }
}
