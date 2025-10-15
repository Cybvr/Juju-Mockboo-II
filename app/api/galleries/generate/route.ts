import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || ''
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, aspectRatio = '1:1', outputs = 4 } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const numOutputs = Math.min(Math.max(parseInt(outputs.toString()), 1), 4);

    const response = await genAI.models.generateImages({
      model: "imagen-3.0-generate-002",
      prompt: prompt,
      config: {
        numberOfImages: numOutputs,
        aspectRatio: aspectRatio,
      },
    });

    const generatedImages: string[] = [];

    if (response.generatedImages) {
      for (let i = 0; i < response.generatedImages.length; i++) {
        const generatedImage = response.generatedImages[i];
        if (generatedImage.image?.imageBytes) {
          // Convert base64 to blob
          const imageData = generatedImage.image.imageBytes;
          const blob = new Blob([Buffer.from(imageData, 'base64')], { type: 'image/png' });

          // Upload to Firebase Storage
          const filename = `gallery_${Date.now()}_${i}.png`;
          const storageRef = ref(storage, `galleries/${filename}`);
          await uploadBytes(storageRef, blob);
          const downloadURL = await getDownloadURL(storageRef);

          generatedImages.push(downloadURL);
        }
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