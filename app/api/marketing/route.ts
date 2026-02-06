import { NextResponse } from 'next/server'
import { MarketingService } from '@/lib/services/marketing.service'

export async function POST(req: Request) {
  try {
    const { projectId } = await req.json();

    if (!projectId) {
      return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });
    }

    const data = await MarketingService.generateMetadata(projectId);

    return NextResponse.json({ 
      success: true, 
      data 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}