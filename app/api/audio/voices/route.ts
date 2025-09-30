
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs voices API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch voices' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Transform and filter voices for better UX
    const transformedVoices = data.voices?.map((voice: any) => ({
      voice_id: voice.voice_id,
      name: voice.name,
      category: voice.category || 'generated',
      description: voice.description,
    })) || [];

    return NextResponse.json({
      voices: transformedVoices,
    });

  } catch (error) {
    console.error('Voices fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
