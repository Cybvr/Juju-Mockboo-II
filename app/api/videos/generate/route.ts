
import { NextRequest, NextResponse } from 'next/server';
import Replicate from "replicate";
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function POST(request: NextRequest) {
  console.log('Video generation API called with ByteDance SeeDance');
  try {
    const body = await request.json();
    console.log('Request body:', body);
    const {
      prompt,
      duration = 5,
      cfg_scale = 0.5,
      aspect_ratio = "16:9",
      negative_prompt = ""
    } = body;

    // Kling v1.6 only accepts 5 or 10 seconds
    const validDuration = duration > 7 ? 10 : 5;

    if (!prompt) {
      console.log('Error: No prompt provided');
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      console.log('Error: Replicate API token not configured');
      return NextResponse.json({ error: 'Replicate API token not configured' }, { status: 500 });
    }

    console.log('API token found, proceeding with ByteDance SeeDance generation');
    const replicate = new Replicate({ auth: apiToken });

    const input = {
      fps: 24,
      prompt,
      duration: validDuration,
      resolution: "480p",
      aspect_ratio,
      camera_fixed: false
    };

    console.log('Calling ByteDance SeeDance API with input:', input);

    const output = await replicate.run("bytedance/seedance-1-lite", { input });
    console.log('ByteDance SeeDance generation successful:', output);

    // Handle ByteDance SeeDance output format
    let videoBlob: Blob;
    let videoUrl: string;

    if (typeof output === 'string') {
      videoUrl = output;
    } else if (output && typeof output === 'object' && 'url' in output) {
      videoUrl = typeof output.url === 'function' ? output.url() : output.url;
    } else {
      console.error('Unexpected output format:', output);
      return NextResponse.json(
        { error: 'Unexpected API response format' },
        { status: 500 }
      );
    }

    console.log('Extracted video URL:', videoUrl);

    // Convert URL object to string if needed
    const videoUrlString = videoUrl instanceof URL ? videoUrl.href : String(videoUrl);

    if (!videoUrlString || !videoUrlString.startsWith('http')) {
      console.error('Invalid video URL format:', videoUrlString);
      return NextResponse.json(
        { error: 'Invalid video URL received from API' },
        { status: 500 }
      );
    }

    // Use the string version for fetch
    videoUrl = videoUrlString;

    // Download video from Replicate
    console.log('Downloading video from URL:', videoUrl);
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      console.error('Failed to download video:', videoResponse.status);
      return NextResponse.json(
        { error: 'Failed to download generated video' },
        { status: 500 }
      );
    }
    videoBlob = await videoResponse.blob();
    console.log('Video downloaded, size:', videoBlob.size, 'bytes');

    // Upload to Firebase Storage
    const timestamp = Date.now();
    const fileName = `video-${timestamp}.mp4`;
    const videoPath = `videos/generated/${fileName}`;
    console.log('Uploading to Firebase Storage:', videoPath);
    const videoRef = ref(storage, videoPath);
    await uploadBytes(videoRef, videoBlob);

    // Get Firebase download URL
    const firebaseVideoUrl = await getDownloadURL(videoRef);
    console.log('Video uploaded to Firebase:', firebaseVideoUrl);

    // Update document if documentId is provided
    const documentId = body.documentId;
    if (documentId) {
      try {
        console.log('Updating document with video URL:', documentId);
        const { documentService } = await import('@/services/documentService');
        await documentService.updateDocument(documentId, {
          content: {
            prompt: prompt,
            duration: duration,
            mode: mode,
            videoUrls: [firebaseVideoUrl],
            status: 'completed',
            generatedAt: new Date().toISOString()
          },
          type: "video",
          updatedAt: new Date()
        });
        console.log('Document updated successfully');
      } catch (updateError) {
        console.error('Failed to update document:', updateError);
        // Continue with response even if document update fails
      }
    }

    // Return Firebase URL in the final response
    return NextResponse.json({
      data: {
        task_id: `kling_${Date.now()}`,
        output: [{ url: firebaseVideoUrl }],
        status: 'completed',
        documentId: documentId
      }
    });
  } catch (error) {
    console.error('Video generation error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}
