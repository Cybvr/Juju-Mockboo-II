import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { action, prompt, model = 'sora-2', size = '1280x720', seconds = '8', aspectRatio = '16:9' } = await request.json();

    switch (action) {
      case 'generateVideo':
        if (!prompt) {
          return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        // Handle different models
        switch (model) {
          case 'sora-2':
          case 'sora-2-pro':
            return await generateWithSora(prompt, model, size, seconds);

          case 'kling':
            return await generateWithKling(prompt, seconds, aspectRatio);

          case 'veo':
            return await generateWithVeo(prompt, seconds, aspectRatio);

          default:
            return NextResponse.json({ error: 'Unsupported model' }, { status: 400 });
        }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Shorts API error:', error);
    return NextResponse.json({ error: 'API request failed' }, { status: 500 });
  }
}

async function generateWithSora(prompt: string, model: string, size: string, seconds: string) {
  try {
    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json({ error: 'Replicate API token not configured' }, { status: 500 });
    }

    const Replicate = require('replicate');
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

    console.log('Creating Sora video with params:', { model, prompt, size, seconds });

    // Map our model names to Replicate model names
    const replicateModel = model === 'sora-2-pro' ? 'openai/sora-2-pro' : 'openai/sora-2';

    const input = {
      prompt: prompt,
      seconds: parseInt(seconds),
      aspect_ratio: size === '1280x720' ? 'landscape' : size === '720x1280' ? 'portrait' : 'landscape'
    };

    console.log('Calling Replicate Sora with input:', input);

    const output = await replicate.run(replicateModel, { input });

    console.log('Sora video creation started:', output);

    // Extract the video URL from the output
    let replicateVideoUrl = '';
    if (typeof output === 'string') {
      replicateVideoUrl = output;
    } else if (output && typeof output === 'object' && 'url' in output) {
      replicateVideoUrl = typeof output.url === 'function' ? output.url() : output.url;
    } else if (Array.isArray(output) && output.length > 0) {
      replicateVideoUrl = output[0];
    }

    if (!replicateVideoUrl) {
      throw new Error('No video URL returned from Replicate');
    }

    // Download video from Replicate
    console.log('Downloading video from URL:', replicateVideoUrl);
    const videoResponse = await fetch(replicateVideoUrl);
    if (!videoResponse.ok) {
      throw new Error(`Failed to download video from Replicate`);
    }
    const videoBlob = await videoResponse.blob();

    // Upload to Firebase Storage (same pattern as other APIs)
    const { storage } = await import('@/lib/firebase');
    const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');

    const timestamp = Date.now();
    const fileName = `short_video_${timestamp}.mp4`;
    const videoPath = `shorts/${fileName}`;
    const videoRef = ref(storage, videoPath);
    await uploadBytes(videoRef, videoBlob);

    // Get permanent Firebase URL
    const firebaseVideoUrl = await getDownloadURL(videoRef);
    console.log('Video uploaded to Firebase:', firebaseVideoUrl);

    return NextResponse.json({ 
      success: true, 
      data: { 
        id: `sora_${Date.now()}`,
        status: 'completed',
        output: firebaseVideoUrl,
        model: 'sora'
      }, 
      model: 'sora' 
    });
  } catch (error) {
    console.error('Sora generation error:', error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('Invalid model')) {
        return NextResponse.json(
          { error: 'Invalid model selected. Please try Sora 2 or Sora 2 Pro.' },
          { status: 400 }
        );
      }
      if (error.message.includes('quota exceeded')) {
        return NextResponse.json(
          { error: 'API quota exceeded. Please try again later.' },
          { status: 429 }
        );
      }
    }

    // If Sora is down, try Kling as fallback
    if (error instanceof Error && error.message.includes('temporarily unavailable')) {
      console.log('Sora is down, falling back to Kling...');
      return generateWithKling(prompt, seconds, aspectRatio);
    }
    
    return NextResponse.json(
      { error: 'Failed to create Sora video', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function generateWithKling(prompt: string, seconds: string, aspectRatio: string) {
  try {
    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json({ error: 'Replicate API token not configured' }, { status: 500 });
    }

    const Replicate = require('replicate');
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

    // Kling v1.6 only accepts 5 or 10 seconds
    const validDuration = parseInt(seconds) > 7 ? 10 : 5;

    const input = {
      prompt: prompt,
      duration: validDuration,
      cfg_scale: 0.5,
      aspect_ratio: aspectRatio,
      negative_prompt: ""
    };

    console.log('Creating Kling video with params:', input);

    const output = await replicate.run("kwaivgi/kling-v1.6-standard", { input });

    return NextResponse.json({ 
      success: true, 
      data: { 
        id: `kling_${Date.now()}`,
        status: 'in_progress',
        output: output,
        model: 'kling'
      }, 
      model: 'kling' 
    });
  } catch (error) {
    console.error('Kling generation error:', error);
    return NextResponse.json(
      { error: 'Failed to create Kling video', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function generateWithVeo(prompt: string, seconds: string, aspectRatio: string) {
  try {
    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json({ error: 'Replicate API token not configured' }, { status: 500 });
    }

    const Replicate = require('replicate');
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

    const input = {
      fps: 24,
      prompt: prompt,
      duration: parseInt(seconds),
      resolution: "480p",
      aspect_ratio: aspectRatio,
      camera_fixed: false
    };

    console.log('Creating Veo video with params:', input);

    const output = await replicate.run("bytedance/seedance-1-lite", { input });

    return NextResponse.json({ 
      success: true, 
      data: { 
        id: `veo_${Date.now()}`,
        status: 'in_progress',
        output: output,
        model: 'veo'
      }, 
      model: 'veo' 
    });
  } catch (error) {
    console.error('Veo generation error:', error);
    return NextResponse.json(
      { error: 'Failed to create Veo video', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}