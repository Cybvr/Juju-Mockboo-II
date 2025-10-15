
import { NextRequest, NextResponse } from 'next/server';
import { generateScript } from '@/services/filmService';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const script = await generateScript(prompt);

    return NextResponse.json({
      success: true,
      script
    });
  } catch (error) {
    console.error('Film script generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate script' },
      { status: 500 }
    );
  }
}
