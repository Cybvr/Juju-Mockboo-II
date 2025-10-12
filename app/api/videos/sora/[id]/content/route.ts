
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const videoId = params.id
    console.log('Downloading Sora video content for ID:', videoId)

    const content = await openai.videos.downloadContent(videoId)
    const buffer = Buffer.from(await content.arrayBuffer())

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Sora video download error:', error)
    return NextResponse.json(
      { error: 'Failed to download video', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
