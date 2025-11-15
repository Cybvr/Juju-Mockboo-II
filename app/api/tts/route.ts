import { NextRequest, NextResponse } from 'next/server';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function POST(request: NextRequest) {
  try {
    const { text, voiceId, modelId, userId, ttsId } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (!userId || !ttsId) {
      return NextResponse.json({ error: 'userId and ttsId are required' }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ELEVENLABS_API_KEY not configured' }, { status: 500 });
    }

    const elevenlabs = new ElevenLabsClient({ apiKey });

    const audio = await elevenlabs.textToSpeech.convert(
      voiceId || 'JBFqnCBsd6RMkjVDRZzb',
      {
        text,
        modelId: modelId || 'eleven_multilingual_v2',
        outputFormat: 'mp3_44100_128',
      }
    );

    const chunks: Uint8Array[] = [];
    const reader = audio.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const audioBuffer = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      audioBuffer.set(chunk, offset);
      offset += chunk.length;
    }

    const blob = new Blob([Buffer.from(audioBuffer)], { type: 'audio/mpeg' });
    const storageRef = ref(storage, `tts/${userId}/${ttsId}.mp3`);
    await uploadBytes(storageRef, blob);
    const audioUrl = await getDownloadURL(storageRef);

    return NextResponse.json({ 
      audioUrl,
      mimeType: 'audio/mpeg'
    });
  } catch (error: any) {
    console.error('TTS Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to generate speech' 
    }, { status: 500 });
  }
}
