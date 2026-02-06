import { supabaseAdmin } from '../supabaseServer'

export class MarketingService {
  
  static async generateMetadata(projectId: string) {
    // 1. Fetch Project & Script
    const { data: project } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (!project) throw new Error('Project not found');

    // 2. Generate "Smart" Mock Data (Free)
    // In production, you would replace this with an OpenAI call:
    // const prompt = `Write 5 viral titles for a video about ${project.title}...`;
    
    const baseTitle = project.title || 'Untitled Video';
    
    const marketingPackage = {
      titles: [
        `Why ${baseTitle} is Changing Everything`,
        `The Truth About ${baseTitle} (Explained)`,
        `I Tried ${baseTitle} and Here is What Happened`,
        `Top 10 Secrets of ${baseTitle}`,
        `Don't Start ${baseTitle} Until You Watch This`
      ],
      description: `In this video, we dive deep into ${baseTitle}. \n\nWe cover everything you need to know about the topic, including key insights and hidden details that most people miss. Whether you are a beginner or an expert, this breakdown of ${baseTitle} will give you a fresh perspective.\n\nDon't forget to LIKE and SUBSCRIBE for more content about ${baseTitle}!`,
      tags: [
        `#${baseTitle.replace(/\s+/g, '')}`,
        '#ViralVideo',
        '#Trending',
        '#Explained',
        '#DeepDive',
        '#Review',
        '#HowTo',
        '#Guide',
        '#2026Trends',
        '#MustWatch'
      ]
    };

    // 3. Save to Database
    const { error } = await supabaseAdmin
      .from('projects')
      .update({ marketing_data: marketingPackage })
      .eq('id', projectId);

    if (error) throw error;

    return marketingPackage;
  }
}