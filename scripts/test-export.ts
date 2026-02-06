// 1. Force load the Next.js environment variables
// This fixes the "supabaseUrl is required" error
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// 2. Import Services
const { supabaseAdmin } = require('../lib/supabaseServer');
const { ProjectService } = require('../lib/services/project.service');
const { AssetService } = require('../lib/services/asset.service');

async function testExportEngine() {
  console.log('?? Starting Local Export Test...');

  try {
    // 3. Setup: Create Dummy Data
    const { data: user } = await supabaseAdmin.auth.admin.listUsers();
    
    // Fallback: If no users exist, create a fake ID (RLS is bypassed by Admin client anyway)
    const testUserId = user.users[0]?.id || '00000000-0000-0000-0000-000000000000';
    console.log(`   -> Testing with User ID: ${testUserId}`);

    console.log('   -> Creating test project...');
    const { data: project, error: projError } = await supabaseAdmin.from('projects').insert({
      user_id: testUserId,
      title: 'Export Test Project',
      status: 'draft'
    }).select().single();

    if (projError) throw new Error(`Project creation failed: ${projError.message}`);

    console.log('   -> Creating test scene...');
    const { data: scene, error: sceneError } = await supabaseAdmin.from('scenes').insert({
      project_id: project.id,
      sequence_order: 1,
      audio_text: 'Hello World',
      visual_description: 'Test visual'
    }).select().single();

    if (sceneError) throw new Error(`Scene creation failed: ${sceneError.message}`);

    console.log('   -> Adding and selecting asset...');
    await AssetService.saveAssetOption(scene.id, {
      type: 'stock',
      source: 'pexels',
      url: 'https://test.com/video.mp4'
    });

    // 4. Test the Export Logic
    console.log('?? Running ProjectService.exportProjectPackage...');
    const result = await ProjectService.exportProjectPackage(project.id);

    // 5. Validate Output
    if (result.project.title !== 'Export Test Project') throw new Error('Title mismatch');
    if (result.timeline.length !== 1) throw new Error('Timeline length mismatch');
    if (result.timeline[0].visual.asset_url !== 'https://test.com/video.mp4') throw new Error('Asset URL mismatch');

    console.log('? EXPORT SUCCESS! Payload structure:');
    console.log(JSON.stringify(result, null, 2));

    // 6. Cleanup
    console.log('?? Cleaning up...');
    await supabaseAdmin.from('projects').delete().eq('id', project.id);

  } catch (error) {
    console.error('? EXPORT TEST FAILED:', error);
    process.exit(1);
  }
}

testExportEngine();
