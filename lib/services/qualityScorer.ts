import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ScoredConcept {
  text: string;
  score: number;
  reasoning: string;
  metrics: {
    clickability: number;
    curiosity: number;
    uniqueness: number;
  };
}

export class QualityScorer {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async scoreTitle(title: string, context: string): Promise<ScoredConcept> {
    const model = this.genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash', // Fast & Cheap for scoring
        generationConfig: { responseMimeType: "application/json" } 
    });

    const prompt = `
      You are a viral content analyst. Score this YouTube title from 1-10.
      Title: "${title}"
      Context: ${context}
      
      Provide scores for:
      1. Clickability (1-10): How likely to get clicked.
      2. Clarity (1-10): How clear the topic is.
      3. Curiosity (1-10): How much curiosity gap it creates.
      4. Uniqueness (1-10): How original/different it is.

      Return ONLY valid JSON:
      {
        "score": <average of all 4 (float)>,
        "reasoning": "<short sentence explanation>",
        "clickability": <1-10>,
        "curiosity": <1-10>,
        "uniqueness": <1-10>
      }
    `;

    try {
        const result = await model.generateContent(prompt);
        const parsed = JSON.parse(result.response.text());

        return {
            text: title,
            score: parsed.score || 0,
            reasoning: parsed.reasoning || "No reasoning provided",
            metrics: {
                clickability: parsed.clickability || 0,
                curiosity: parsed.curiosity || 0,
                uniqueness: parsed.uniqueness || 0,
            },
        };
    } catch (e) {
        console.error("Scoring failed", e);
        // Fallback if scoring fails
        return {
            text: title,
            score: 5,
            reasoning: "Scoring service unavailable",
            metrics: { clickability: 5, curiosity: 5, uniqueness: 5 }
        };
    }
  }

  async batchScore(titles: string[], context: string): Promise<ScoredConcept[]> {
    // Parallel processing for speed
    const promises = titles.map(t => this.scoreTitle(t, context));
    const results = await Promise.all(promises);
    return results.sort((a, b) => b.score - a.score); // Return best first
  }
}
