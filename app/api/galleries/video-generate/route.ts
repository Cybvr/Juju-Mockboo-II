
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
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

    // Generate videos with Sora
    for (let i = 0; i < numOutputs; i++) {
      const videoPrompt = `${basePrompt}

This is video ${i + 1} of ${numOutputs} total videos requested. Create a cinematic ${seconds}-second video that explores this concept with dynamic motion and engaging visuals.`;

      try {
        // Create video with Sora
        const video = await openai.videos.create({
          model: 'sora-2',
          prompt: videoPrompt,
          size: '1280x720',
          seconds: seconds.toString()
        });

        // Poll for completion
        let videoStatus = video;
        while (videoStatus.status === 'in_progress' || videoStatus.status === 'queued') {
          await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
          videoStatus = await openai.videos.retrieve(video.id);
        }

        if (videoStatus.status === 'completed') {
          // Download the video content
          const videoContent = await openai.videos.downloadContent(video.id);
          const videoBlob = new Blob([await videoContent.arrayBuffer()], { type: 'video/mp4' });

          // Upload to Firebase Storage
          const filename = `gallery_video_${Date.now()}_${i}.mp4`;
          const storageRef = ref(storage, `galleries/videos/${filename}`);
          await uploadBytes(storageRef, videoBlob);
          const downloadURL = await getDownloadURL(storageRef);

          generatedVideos.push(downloadURL);
        } else if (videoStatus.status === 'failed') {
          console.error('Video generation failed:', videoStatus.error);
          throw new Error(videoStatus.error?.message || 'Video generation failed');
        }
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
