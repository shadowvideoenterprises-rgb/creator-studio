import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const zip = new JSZip();

    // Add a script file
    zip.file("script.txt", "This is a dummy script for the exported video.");

    // Add a sample image (using a placeholder image service)
    const imageUrl = 'https://picsum.photos/200/300';
    const imageResponse = await fetch(imageUrl);
    const imageBlob = await imageResponse.blob();
    zip.file("sample_image.jpg", imageBlob);

    const content = await zip.generateAsync({ type: "nodebuffer" });

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="export_${params.id}.zip"`,
      }
    });

  } catch (error) {
    console.error('Export failed:', error);
    return NextResponse.json({ error: 'Failed to export project' }, { status: 500 });
  }
}
