export class JsonValidator {
  
  static clean(text: string): string {
    // Remove Markdown code blocks if present
    let clean = text.replace(/```json/g, '').replace(/```/g, '');
    return clean.trim();
  }

  static parse(text: string, fallback: any = null): any {
    try {
      const cleaned = this.clean(text);
      return JSON.parse(cleaned);
    } catch (e) {
      console.warn("JSON Parse Failed. Text:", text.substring(0, 50) + "...");
      return fallback;
    }
  }

  static validate(data: any, schema: string[]): boolean {
    if (!data) return false;
    // Simple check: does it have the required keys?
    return schema.every(key => key in data);
  }
}
