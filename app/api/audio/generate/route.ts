
import { NextRequest, NextResponse } from 'next/server';
import { documentService } from '@/services/documentService';
import { storageService } from '@/services/storageService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      text,
      voice_id,
      voice_settings = { stability: 0.5, similarity_boost: 0.5 },
      userId
    } = body;

    if (!text || !voice_id || !userId) {
      return NextResponse.json(
        { error: 'Text, voice_id, and userId are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      );
    }

    // Generate audio with ElevenLabs
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to generate audio' },
        { status: response.status }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    
    // Convert buffer to base64 for upload
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    const audioDataUrl = `data:audio/mpeg;base64,${base64Audio}`;
    
    // Upload to Firebase Storage
    const audioUrl = await storageService.uploadAudio(userId, audioDataUrl);

    // Get voice name from voices list
    const voicesResponse = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': apiKey,
      },
    });
    
    let voiceName = 'Unknown Voice';
    if (voicesResponse.ok) {
      const voicesData = await voicesResponse.json();
      const voice = voicesData.voices?.find((v: any) => v.voice_id === voice_id);
      if (voice) {
        voiceName = voice.name;
      }
    }

    // Save to document service
    const documentData = {
      title: `Audio - ${new Date().toLocaleDateString()}`,
      content: {
        audioUrl,
        originalText: text,
        voiceId: voice_id,
        voiceName,
        settings: voice_settings,
        generatedAt: new Date().toISOString(),
      },
      tags: ['audio', 'text-to-speech', 'elevenlabs'],
      type: 'audio' as const,
      isPublic: false,
      starred: false,
      shared: false,
      category: 'UGC' as const,
    };

    const documentId = await documentService.createDocument(userId, documentData);

    return NextResponse.json({
      success: true,
      documentId,
      audioUrl,
    });

  } catch (error) {
    console.error('Audio generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
