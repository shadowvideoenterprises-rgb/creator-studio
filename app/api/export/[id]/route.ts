import { NextResponse } from 'next/server'
import { ProjectService } from '@/lib/services/project.service'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Use the service to generate the bundle
    const exportData = await ProjectService.exportProjectPackage(id)

    return NextResponse.json({ 
      success: true, 
      data: exportData 
    })

  } catch (error: any) {
    console.error('Export Failed:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}