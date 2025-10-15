import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

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

    // Validate outputs count (Imagen allows 1-4)
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
      for (const generatedImage of response.generatedImages) {
        if (generatedImage.image?.imageBytes) {
          const imageData = generatedImage.image.imageBytes;
          const dataUrl = `data:image/png;base64,${imageData}`;
          generatedImages.push(dataUrl);
        }
      }
    }

    if (generatedImages.length === 0) {
      throw new Error('No images were generated');
    }

    // Just return the generated images - no Firebase mess
    return NextResponse.json({
      success: true,
      images: generatedImages.map((url, index) => ({
        id: `${Date.now()}_${index}`,
        url: url,
        prompt: prompt,
        createdAt: Date.now(),
        aspectRatio: aspectRatio
      })),
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