export interface SceneAsset {
  id: string;
  project_id: string;
  scene_id: string;
  asset_type: 'image' | 'video' | 'stock' | 'audio' | 'ai_image' | 'ai_video';
  asset_url: string;
  provider: string; 
  status: string;
  created_at: string;
  prompt_used?: string;
  is_selected: boolean; // Added this field
}

export interface Scene {
  id: string;
  project_id: string;
  sequence_order: number;
  visual_description: string;
  audio_text: string;
  status: string;
  scene_assets?: SceneAsset[]; 
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: 'draft' | 'processing' | 'completed';
  created_at: string;
  marketing_data?: any;
}

export interface Job {
  id: string;
  user_id: string;
  type: 'script_gen' | 'asset_batch' | 'audio_gen';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  message?: string;
  created_at: string;
  updated_at: string;
}
