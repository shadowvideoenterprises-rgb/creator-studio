import { supabaseAdmin } from '@/lib/supabaseServer';

export class VersionService {
  
  static async createSnapshot(projectId: string, userId: string, label: string = 'Auto-Save') {
    try {
        // 1. Fetch current state
        const { data: project } = await supabaseAdmin.from('projects').select('*').eq('id', projectId).single();
        const { data: scenes } = await supabaseAdmin.from('scenes').select('*').eq('project_id', projectId).order('sequence_order');
        
        // 2. Pack data
        const snapshotData = {
            project: project,
            scenes: scenes,
            timestamp: new Date().toISOString()
        };

        // 3. Save to 'project_versions' table
        /*
          Needs Table: 
          create table project_versions (
            id uuid default uuid_generate_v4() primary key,
            project_id uuid references projects,
            label text,
            data jsonb,
            created_at timestamp default now()
          );
        */
        const { error } = await supabaseAdmin.from('project_versions').insert({
            project_id: projectId,
            label: label,
            data: snapshotData
        });

        if (error) console.error("Snapshot failed:", error.message);
        return !error;

    } catch (e) {
        console.error("VersionService Error", e);
        return false;
    }
  }

  static async restoreSnapshot(versionId: string) {
    try {
        // 1. Get Snapshot
        const { data: version } = await supabaseAdmin.from('project_versions').select('*').eq('id', versionId).single();
        if (!version) throw new Error("Version not found");

        const { project, scenes } = version.data;

        // 2. Restore Project Level Data
        await supabaseAdmin.from('projects').update({
            title: project.title,
            description: project.description,
            thumbnail_url: project.thumbnail_url,
            outline: project.outline
        }).eq('id', version.project_id);

        // 3. Restore Scenes (Delete current, Insert old)
        // Note: This is a "Hard Restore". Be careful.
        await supabaseAdmin.from('scenes').delete().eq('project_id', version.project_id);
        
        // Clean scene IDs to ensure new inserts don't conflict (or keep them if you want strict restoration)
        const cleanScenes = scenes.map((s: any) => {
            const { id, created_at, ...rest } = s; 
            return { ...rest, project_id: version.project_id };
        });

        await supabaseAdmin.from('scenes').insert(cleanScenes);
        
        return true;

    } catch (e) {
        console.error("Restore failed", e);
        return false;
    }
  }
}
