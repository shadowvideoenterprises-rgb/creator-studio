import { supabaseAdmin } from '@/lib/supabaseServer';
import { BatchService } from '@/lib/services/batch.service';
import { AssetService } from '@/lib/services/asset.service';

async function runSmokeTest() {
  console.log('🔥 Starting Smoke Test for Asset Engine...');

  try {
    // 1. Setup: Create a dummy project and scene
    const { data: user } = await supabaseAdmin.auth.admin.listUsers();
    const testUserId = user.users[0]?.id; // Grab the first user for testing

    if (!testUserId) throw new Error('No users found in database to test with.');

    console.log(`👤 Testing as User: ${testUserId}`);

    const { data: project } = await supabaseAdmin.from('projects').insert({
      user_id: testUserId,
      title: 'Smoke Test Project',
      status: 'draft'
    }).select().single();

    const { data: scene } = await supabaseAdmin.from('scenes').insert({
      project_id: project.id,
      sequence_order: 1,
      audio_text: 'Test audio',
      visual_description: 'A futuristic city with flying cars'
    }).select().single();

    console.log(`✅ Setup Complete. Project: ${project.id}, Scene: ${scene.id}`);

    // 2. Test Asset Service (Save Option)
    console.log('🧪 Testing AssetService.saveAssetOption...');
    const asset1 = await AssetService.saveAssetOption(scene.id, {
      type: 'stock',
      source: 'pexels',
      url: 'http://test.com/video1.mp4'
    });
    
    if (asset1.is_selected !== true) throw new Error('First asset was not auto-selected!');
    console.log('   -> Asset 1 saved and auto-selected.');

    const asset2 = await AssetService.saveAssetOption(scene.id, {
      type: 'ai_image',
      source: 'imagen',
      url: 'http://test.com/image1.png'
    });

    if (asset2.is_selected === true) throw new Error('Second asset should NOT be selected by default.');
    console.log('   -> Asset 2 saved as option.');

    // 3. Test Selection Logic
    console.log('🧪 Testing AssetService.selectAsset...');
    await AssetService.selectAsset(scene.id, asset2.id);
    
    const { data: updatedAsset1 } = await supabaseAdmin.from('scene_assets').select().eq('id', asset1.id).single();
    const { data: updatedAsset2 } = await supabaseAdmin.from('scene_assets').select().eq('id', asset2.id).single();

    if (updatedAsset1.is_selected) throw new Error('Asset 1 failed to unselect');
    if (!updatedAsset2.is_selected) throw new Error('Asset 2 failed to select');
    console.log('   -> Selection logic verified.');

    // 4. Test Batch Service (Job Creation)
    console.log('🧪 Testing BatchService.processAllScenes...');
    const jobId = await BatchService.processAllScenes(project.id, testUserId);
    console.log(`   -> Batch Job triggered. ID: ${jobId}`);

    // Cleanup
    console.log('🧹 Cleaning up test data...');
    await supabaseAdmin.from('projects').delete().eq('id', project.id);
    
    console.log('🎉 TEST PASSED: Asset Engine is fully operational.');

  } catch (error) {
    console.error('❌ TEST FAILED:', error);
    process.exit(1);
  }
}

runSmokeTest();