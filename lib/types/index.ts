export type ProjectStatus = 'draft' | 'processing' | 'completed' | 'failed';

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  metadata: any;
  created_at: string;
}

export type AssetType = 'stock' | 'ai_image' | 'uploaded';
export type AssetSource = 'pexels' | 'pixabay' | 'unsplash' | 'imagen' | 'gemini' | 'user';

export interface SceneAsset {
  id: string;
  scene_id: string;
  type: AssetType;
  source: AssetSource;
  external_id?: string;
  url: string;
  prompt?: string;
  is_selected: boolean;
  created_at: string;
}

export interface Scene {
  id: string;
  project_id: string;
  sequence_order: number;
  audio_text: string;
  visual_description: string;
  // The new asset array
  assets?: SceneAsset[];
  // Helper for the UI
  selected_asset_url?: string; 
}

export interface Job {
  id: string;
  user_id: string;
  type: 'script_gen' | 'asset_batch' | 'audio_gen';
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  message: string;
  result?: any;
  error?: string;
}

export interface CostRecord {
  id: string;
  project_id: string;
  user_id: string;
  service: string;
  amount: number;
  created_at: string;
}
