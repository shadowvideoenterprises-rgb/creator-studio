import { OpenAI } from 'openai';

export class AudioService {
  
  static async generateVoiceover(text: string, settings: any): Promise<{ audioData: string, duration: number, provider: string }> {
    const keys = settings?.api_keys || {};
    
    // PRIORITY 1: ElevenLabs (Best Quality)
    if (keys.elevenlabs) {
        try {
            console.log("Generating with ElevenLabs...");
            const voiceId = settings.default_voice_id || '21m00Tcm4TlvDq8ikWAM'; // Default "Rachel"
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': keys.elevenlabs
                },
                body: JSON.stringify({
                    text: text,
                    model_id: "eleven_monolingual_v1",
                    voice_settings: { stability: 0.5, similarity_boost: 0.75 }
                })
            });

            if (!response.ok) throw new Error("ElevenLabs API Error");
            
            const arrayBuffer = await response.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString('base64');
            const dataUri = `data:audio/mpeg;base64,${base64}`;
            
            return { audioData: dataUri, duration: 0, provider: 'elevenlabs' }; // Duration calc requires metadata parsing, skipping for speed
        } catch (e) {
            console.error("ElevenLabs failed, falling back...", e);
        }
    }

    // PRIORITY 2: OpenAI (Reliable & Cheaper)
    if (keys.openai) {
        try {
            console.log("Generating with OpenAI TTS...");
            const openai = new OpenAI({ apiKey: keys.openai });
            const mp3 = await openai.audio.speech.create({
                model: "tts-1",
                voice: "alloy",
                input: text,
            });

            const buffer = Buffer.from(await mp3.arrayBuffer());
            const base64 = buffer.toString('base64');
            const dataUri = `data:audio/mpeg;base64,${base64}`;

            return { audioData: dataUri, duration: 0, provider: 'openai-tts' };
        } catch (e) {
            console.error("OpenAI TTS failed", e);
        }
    }

    // FALLBACK: Mock (for testing without keys)
    return { 
        audioData: "data:audio/mp3;base64,//MOCK_DATA...", 
        duration: 5, 
        provider: 'mock-fallback' 
    };
  }
}
