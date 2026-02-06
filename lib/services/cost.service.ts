import { supabase } from '@/lib/supabaseClient'

export class CostService {
  // Pricing constants (Example rates for Gemini/Imagen)
  static readonly RATES = {
    GEMINI_SCRIPT: 0.01, // Flat rate per script gen
    IMAGEN_IMAGE: 0.04,  // Per AI image
    STOCK_SEARCH: 0.002, // API cost per search
    TTS_VOICEOVER: 0.005  // Per 100 characters
  }

  static async estimateProjectCost(projectId: string) {
    const { data: scenes } = await supabase
      .from('scenes')
      .select('asset_type, audio_text')
      .eq('project_id', projectId)

    if (!scenes) return 0

    let total = this.RATES.GEMINI_SCRIPT

    scenes.forEach(scene => {
      if (scene.asset_type === 'ai_image') total += this.RATES.IMAGEN_IMAGE
      if (scene.audio_text) total += (scene.audio_text.length / 100) * this.RATES.TTS_VOICEOVER
    })

    return parseFloat(total.toFixed(4))
  }

  static async logActualCost(projectId: string, userId: string, service: string, amount: number) {
    await supabase.from('costs').insert({
      project_id: projectId,
      user_id: userId,
      service: service,
      amount: amount
    })
  }
}