import { supabaseAdmin } from '../supabaseServer'
import * as googleTTS from 'google-tts-api';

export class AudioService {
  
  static async generateVoiceover(sceneId: string, text: string) {
    console.log(`🎤 Generating (Free) Audio for scene ${sceneId}...`);

    try {
      // 1. Get the direct URL from Google TTS (truncated to 200 chars for safety)
      const safeText = text.substring(0, 200);
      
      const audioUrl = googleTTS.getAudioUrl(safeText, {
        lang: 'en',
        slow: false,
        host: 'https://translate.google.com',
      });

      // 2. Fetch the actual MP3 data (Server-side download)
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // 3. Upload to Supabase Storage
      const fileName = `audio/${sceneId}-${Date.now()}.mp3`;
      
      const { data, error: uploadError } = await supabaseAdmin
        .storage
        .from('project-assets')
        .upload(fileName, buffer, {
          contentType: 'audio/mpeg',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // 4. Get Public URL
      const { data: { publicUrl } } = supabaseAdmin
        .storage
        .from('project-assets')
        .getPublicUrl(fileName);

      // 5. Update Scene Record
      await supabaseAdmin
        .from('scenes')
        .update({ 
          audio_url: publicUrl 
        })
        .eq('id', sceneId);

      console.log(`✅ Audio saved: ${publicUrl}`);
      return publicUrl;

    } catch (error) {
      console.error('⚠️ Audio generation failed:', error);
      throw error;
    }
  }
}