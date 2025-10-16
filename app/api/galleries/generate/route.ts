import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || ''
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, previousPrompt, aspectRatio = '1:1', outputs = 4 } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const numOutputs = Math.min(Math.max(parseInt(outputs.toString()), 1), 4);

    // Build on previous context if available
    const basePrompt = previousPrompt 
      ? `Building on this original concept: "${previousPrompt}"\n\nNow explore: ${prompt}`
      : prompt;

    // Force single composition, distinct theme each time
    const scenePrompts = Array.from({ length: numOutputs }, (_, i) =>
      `Create a single, standalone image based on this case: ${basePrompt}. 
      This should depict one clear and cohesive scene or concept — not a collage, split image, or multiple frames. 
      Make it visually distinct and creatively different from the others. Scene variation ${i + 1}.`
    );

    // Run all image generations in parallel
    const responses = await Promise.all(
      scenePrompts.map(p =>
        genAI.models.generateImages({
          model: "imagen-3.0-generate-002",
          prompt: p,
          config: { aspectRatio }
        })
      )
    );

    const generatedImages: string[] = [];

    // Process each response and upload to Firebase
    for (let r = 0; r < responses.length; r++) {
      const response = responses[r];
      if (response.generatedImages && response.generatedImages[0]?.image?.imageBytes) {
        const imageData = response.generatedImages[0].image.imageBytes;
        const blob = new Blob([Buffer.from(imageData, 'base64')], { type: 'image/png' });

        const filename = `gallery_${Date.now()}_${r}.png`;
        const storageRef = ref(storage, `galleries/${filename}`);
        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);

        generatedImages.push(downloadURL);
      }
    }

    if (generatedImages.length === 0) {
      throw new Error('No images were generated');
    }

    return NextResponse.json({
      success: true,
      images: generatedImages,
      count: generatedImages.length
    });

  } catch (error) {
    console.error('Gallery generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate images: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
