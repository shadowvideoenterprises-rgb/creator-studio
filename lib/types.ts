export interface SceneAsset {
  id: string
  scene_id: string
  type: 'stock' | 'ai_image' | 'ai_video'
  source: 'pexels' | 'shutterstock' | 'imagen' | 'sora'
  url: string
  prompt?: string
  external_id?: string
  is_selected: boolean
  created_at?: string
}

export interface Scene {
  id: string
  project_id: string
  sequence_order: number
  visual_description: string
  audio_text: string
  audio_url?: string | null
  created_at?: string
  assets?: SceneAsset[]
}

export interface Project {
  id: string
  user_id: string
  title: string
  description: string
  status: 'draft' | 'processing' | 'completed'
  created_at: string
}

export interface Job {
  id: string
  user_id: string
  type: 'script_gen' | 'asset_batch' | 'audio_gen'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  message: string
  created_at: string
}
