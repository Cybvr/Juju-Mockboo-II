import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { documentService } from '@/services/documentService';

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || ''
});

export async function POST(request: NextRequest) {
  try {
    const { mode, prompt, image, template, settings } = await request.json();

    // Get user ID from request body or headers
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'User ID required in headers' }, { status: 401 });
    }

    if (mode === "text" && !prompt) {
      return NextResponse.json(
        { error: 'Prompt is required for text-to-image generation' },
        { status: 400 }
      );
    }

    if (mode === "product" && (!image || !template)) {
      return NextResponse.json(
        { error: 'Image and template are required for product generation' },
        { status: 400 }
      );
    }

    let generatedImages: string[] = [];

    if (mode === 'text') {
      // Text-to-image generation using Gemini's image generation
      try {
        const numOutputs = parseInt(settings.outputs) || 1;

        // Use the correct image generation method
        const response = await genAI.models.generateImages({
          model: "imagen-3.0-generate-002",
          prompt: prompt,
          config: {
            numberOfImages: numOutputs,
            aspectRatio: settings.aspectRatio || "1:1",
          },
        });

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
      } catch (error) {
        console.error('Text-to-image generation failed:', error);
        throw error;
      }
    } else {
      // Product generation - combine uploaded image with template
      // For now, return placeholder until we implement image processing
      const placeholderImages = [
        "https://picsum.photos/1024/1024?random=5",
        "https://picsum.photos/1024/1024?random=6",
        "https://picsum.photos/1024/1024?random=7",
        "https://picsum.photos/1024/1024?random=8",
      ];

      const numOutputs = parseInt(settings.outputs) || 1;
      generatedImages = placeholderImages.slice(0, numOutputs);
    }

    return NextResponse.json({
      success: true,
      images: generatedImages,
      count: generatedImages.length,
      metadata: {
        mode,
        model: "imagen-3.0-generate-002",
        aspectRatio: settings.aspectRatio,
        prompt: mode === "text" ? prompt : undefined,
        template: mode === "product" ? template : undefined
      }
    });

  } catch (error) {
    console.error('Image generation error:', error);

    return NextResponse.json(
      { error: 'Failed to generate images: ' + (error as Error).message },
      { status: 500 }
    );
  }
}