
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
    console.log('Checking Sora video status for ID:', videoId)

    const video = await openai.videos.retrieve(videoId)
    console.log('Sora video status:', video)

    return NextResponse.json(video)
  } catch (error) {
    console.error('Sora video status error:', error)
    return NextResponse.json(
      { error: 'Failed to get video status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
