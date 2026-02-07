export const MODEL_LABELS: Record<string, string> = {
  // OPENAI
  'gpt-4o': 'OpenAI: GPT-4o (Smartest)',
  'gpt-4-turbo': 'OpenAI: GPT-4 Turbo',
  'gpt-3.5-turbo': 'OpenAI: GPT-3.5 Turbo (Chat)',
  'gpt-3.5-turbo-instruct': 'OpenAI: GPT-3.5 Legacy (Instruct)',
  
  // GOOGLE REAL IDS
  'gemini-3-pro-preview': 'Google: Gemini 3 Pro (Preview)',
  'gemini-3-flash-preview': 'Google: Gemini 3 Flash (Preview)',
  'gemini-2.5-pro': 'Google: Gemini 2.5 Pro',
  'gemini-2.5-flash': 'Google: Gemini 2.5 Flash',
  
  // VISUALS
  'nano-banana-pro': 'Google: Nano Banana Pro (Gemini 3 Image)',
  'nano-banana': 'Google: Nano Banana (Flash Image)',
  'dall-e-3': 'OpenAI: DALL-E 3',
  'replicate-flux': 'Replicate: Flux Pro'
}

// 1. WRITERS (Scripting)
export const VALID_SCRIPT_MODELS = [
  'gemini-3-pro-preview',
  'gemini-3-flash-preview',
  'gemini-2.5-pro',
  'gemini-2.5-flash',
  'gpt-4o', 
  'gpt-4-turbo', 
  'gpt-3.5-turbo',
  'gpt-3.5-turbo-instruct',
  'claude-3-5-sonnet-20240620'
];

// 2. ARTISTS (Visual Engine)
export const VALID_IMAGE_MODELS = [
  'nano-banana-pro',
  'nano-banana',
  'imagen-4-generate',
  'imagen-4-ultra-generate',
  'dall-e-3', 
  'black-forest-labs/flux-schnell',
  'midjourney'
];

// 3. ACTORS (Voice Engine)
export const VALID_AUDIO_MODELS = [
  'gemini-2.5-pro-tts',
  'gemini-2.5-flash-tts',
  'tts-1', 
  'eleven_multilingual_v2'
];

// 4. BLOCKLIST
export const EXCLUDED_KEYWORDS = [
  'transcribe', 'diarize', 'realtime', 'audio', 'vision', 'speech', 'whisper', 
  '16k', '0613', '0301', '0125', '1106', 'preview-tts', 'search', 'mini-tts',
  'native-audio', 'robotics', 'gemma', 'embedding', 'bison', 'gecko'
];

export const sortModels = (models: any[]) => {
    const PRIORITY = ['gemini-3-pro-preview', 'gemini-3-flash-preview', 'gpt-4o', 'gemini-2.5-pro', 'nano-banana-pro'];
    return models.sort((a, b) => {
        const exactA = PRIORITY.indexOf(a.value);
        const exactB = PRIORITY.indexOf(b.value);
        if (exactA !== -1 && exactB !== -1) return exactA - exactB;
        if (exactA !== -1) return -1;
        if (exactB !== -1) return 1;
        return a.label.localeCompare(b.label);
    });
}
