import { supabase } from '@/lib/supabaseClient'

export class DNAService {
  static async getProfile(profileId: string) {
    const { data, error } = await supabase
      .from('channel_profiles')
      .select('*')
      .eq('id', profileId)
      .single()
    
    if (error) return null
    return data
  }

  static async listProfiles(userId: string) {
    const { data } = await supabase
      .from('channel_profiles')
      .select('*')
      .eq('user_id', userId)
    return data || []
  }
}