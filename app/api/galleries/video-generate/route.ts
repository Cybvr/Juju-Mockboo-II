import { NextRequest, NextResponse } from 'next/server';
import Replicate from "replicate";
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, previousPrompt, seconds = 8, outputs = 1, mode, referencePrompt } = await request.json();

    if (!prompt && mode !== 'moreLikeThis') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const numOutputs = Math.min(Math.max(parseInt(outputs.toString()), 1), 4);

    let basePrompt = prompt;

    // "More like this" mode – generate variations of an existing concept
    if (mode === 'moreLikeThis' && referencePrompt) {
      basePrompt = `Generate a fresh creative variation inspired by this concept: "${referencePrompt}". 
      Maintain the same core idea, tone, and visual direction, but reinterpret it uniquely with new details and perspectives.`;
    } else if (previousPrompt) {
      basePrompt = `Building on this original concept: "${previousPrompt}"\n\nNow explore: ${prompt}`;
    }

    const generatedVideos: string[] = [];

    // Generate videos with ByteDance SeeDance
    for (let i = 0; i < numOutputs; i++) {
      const videoPrompt = `${basePrompt}

This is video ${i + 1} of ${numOutputs} total videos requested. Create a cinematic video that explores this concept with dynamic motion and engaging visuals.`;

      try {
        const input = {
          fps: 24,
          prompt: videoPrompt,
          duration: seconds > 7 ? 10 : 5,
          resolution: "1080p",
          aspect_ratio: "16:9",
          camera_fixed: false
        };

        console.log('Calling ByteDance SeeDance API with input:', input);
        const output = await replicate.run("bytedance/seedance-1-pro", { input });
        console.log('ByteDance SeeDance generation successful:', output);

        // Handle ByteDance SeeDance output format
        let videoUrl: string;

        if (typeof output === 'string') {
          videoUrl = output;
        } else if (output && typeof output === 'object' && 'url' in output) {
          videoUrl = typeof output.url === 'function' ? output.url() : output.url;
        } else {
          console.error('Unexpected output format:', output);
          throw new Error('Unexpected API response format');
        }

        console.log('Extracted video URL:', videoUrl);

        // Convert URL object to string if needed
        const videoUrlString = videoUrl instanceof URL ? videoUrl.href : String(videoUrl);

        if (!videoUrlString || !videoUrlString.startsWith('http')) {
          console.error('Invalid video URL format:', videoUrlString);
          throw new Error('Invalid video URL received from API');
        }

        // Download video from Replicate
        console.log('Downloading video from URL:', videoUrlString);
        const videoResponse = await fetch(videoUrlString);
        if (!videoResponse.ok) {
          console.error('Failed to download video:', videoResponse.status);
          throw new Error('Failed to download generated video');
        }
        const videoBlob = await videoResponse.blob();
        console.log('Video downloaded, size:', videoBlob.size, 'bytes');

        // Upload to Firebase Storage - use same path as images
        const timestamp = Date.now();
        const fileName = `gallery_video_${timestamp}_${i}.mp4`;
        const videoPath = `galleries/${fileName}`;
        console.log('Uploading to Firebase Storage:', videoPath);
        const videoRef = ref(storage, videoPath);
        await uploadBytes(videoRef, videoBlob);

        // Get Firebase download URL
        const firebaseVideoUrl = await getDownloadURL(videoRef);
        console.log('Video uploaded to Firebase:', firebaseVideoUrl);

        generatedVideos.push(firebaseVideoUrl);
      } catch (error) {
        console.error(`Error generating video ${i + 1}:`, error);
        // Continue with other videos even if one fails
      }
    }

    if (generatedVideos.length === 0) {
      throw new Error('No videos were generated successfully');
    }

    return NextResponse.json({
      success: true,
      videos: generatedVideos,
      count: generatedVideos.length
    });

  } catch (error) {
    console.error('Gallery video generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate videos: ' + (error as Error).message },
      { status: 500 }
    );
  }
}