// Force load env vars for local testing
// Renamed 'path' to 'nodePath' to avoid conflict
const nodePath = require('path');
require('dotenv').config({ path: nodePath.resolve(__dirname, '../.env.local') });

// Renamed imports to avoid conflicts with test-export.ts
const { supabaseAdmin: audioSupabase } = require('../lib/supabaseServer');
const { AudioService: AudioSvc } = require('../lib/services/audio.service');

async function testAudioPipeline() {
  console.log('?? Starting Audio Pipeline Test...');

  try {
    // 1. Setup: Get a user 
    const { data: user } = await audioSupabase.auth.admin.listUsers();
    
    // Fallback ID if no users exist locally
    const testUserId = user.users[0]?.id || '00000000-0000-0000-0000-000000000000';

    console.log('   -> Creating temp resources...');
    const { data: project } = await audioSupabase.from('projects').insert({
      user_id: testUserId,
      title: 'Audio Test Project',
      status: 'draft'
    }).select().single();

    const { data: scene } = await audioSupabase.from('scenes').insert({
      project_id: project.id,
      sequence_order: 1,
      audio_text: 'Welcome to your new AI Creator Studio. This voice was generated for free.',
      visual_description: 'Test'
    }).select().single();

    // 2. Run the Service
    console.log('?? Calling AudioService.generateVoiceover...');
    const publicUrl = await AudioSvc.generateVoiceover(scene.id, scene.audio_text);

    // 3. Validation
    if (!publicUrl.includes('project-assets')) throw new Error('Returned URL does not point to Supabase Storage');
    
    console.log('? AUDIO SUCCESS! File stored at:');
    console.log(publicUrl);

    // 4. Cleanup
    console.log('?? Cleaning up DB records...');
    await audioSupabase.from('projects').delete().eq('id', project.id);

  } catch (error) {
    console.error('? AUDIO TEST FAILED:', error);
    process.exit(1);
  }
}

testAudioPipeline();
