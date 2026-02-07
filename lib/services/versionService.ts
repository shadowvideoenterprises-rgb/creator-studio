import { supabaseAdmin } from '@/lib/supabaseServer'

export class VersionService {
  
  // 1. Auto-Save (Internal)
  static async saveVersion(projectId: string, scenes: any[], metadata: any = {}) {
    try {
        const { data: latest } = await supabaseAdmin
            .from('script_versions')
            .select('version_number')
            .eq('project_id', projectId)
            .order('version_number', { ascending: false })
            .limit(1)
            .single();
            
        const nextVersion = (latest?.version_number || 0) + 1;

        await supabaseAdmin.from('script_versions').insert({
            project_id: projectId,
            version_number: nextVersion,
            scenes: scenes,
            metadata: metadata
        });

        return nextVersion;
    } catch (error) {
        console.error("Version Save Failed:", error);
        return 0;
    }
  }

  // 2. Manual Save (API)
  static async createSnapshot(projectId: string, userId: string, label: string) {
    try {
        const { data: scenes } = await supabaseAdmin.from('scenes').select('*').eq('project_id', projectId).order('sequence_order');
        if (!scenes || scenes.length === 0) return false;

        await this.saveVersion(projectId, scenes, { label, manual: true, saved_by: userId });
        return true;
    } catch (e) {
        return false;
    }
  }

  // 3. Restore by Number (Internal)
  static async restoreVersion(projectId: string, versionNumber: number) {
      const { data: version } = await supabaseAdmin
        .from('script_versions')
        .select('scenes')
        .eq('project_id', projectId)
        .eq('version_number', versionNumber)
        .single();
      
      if (!version) throw new Error("Version not found");
      return this._performRestore(projectId, version.scenes);
  }

  // 4. Restore by ID (API) - THIS WAS MISSING
  static async restoreSnapshot(versionId: string) {
      try {
        const { data: version } = await supabaseAdmin
            .from('script_versions')
            .select('project_id, scenes')
            .eq('id', versionId)
            .single();
        
        if (!version) return false;

        await this._performRestore(version.project_id, version.scenes);
        return true;
      } catch (e) {
        console.error("Restore Failed", e);
        return false;
      }
  }

  // Helper
  private static async _performRestore(projectId: string, scenes: any[]) {
      await supabaseAdmin.from('scenes').delete().eq('project_id', projectId);
      
      const restoredScenes = scenes.map((s: any) => {
          const { id, ...rest } = s; 
          return { ...rest, project_id: projectId }; 
      });

      if (restoredScenes.length > 0) {
        await supabaseAdmin.from('scenes').insert(restoredScenes);
      }
      return restoredScenes;
  }
}
