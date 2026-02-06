import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url')

  if (!url) return new NextResponse('Missing URL', { status: 400 })

  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Failed to fetch source: ${response.status}`)

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const arrayBuffer = await response.arrayBuffer()

    // Return the image as if it came from OUR server
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*', // Allow anyone to see it
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Proxy Error:', error)
    return new NextResponse('Failed to proxy image', { status: 500 })
  }
}