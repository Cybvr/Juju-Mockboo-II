
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { model = 'sora-2', prompt, size = '1280x720', seconds = '8' } = body

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    console.log('Creating Sora video with params:', { model, prompt, size, seconds })

    const video = await openai.videos.create({
      model,
      prompt,
      size,
      seconds
    })

    console.log('Sora video creation started:', video)

    return NextResponse.json(video)
  } catch (error) {
    console.error('Sora video creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create video', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
