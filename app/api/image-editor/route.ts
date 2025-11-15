import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || '' 
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, image, settings } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    let imageData = image;

    // Handle Firebase URL images
    if (settings?.firebaseUrl) {
      try {
        const response = await fetch(settings.firebaseUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch Firebase image: ${response.status}`);
        }
        const buffer = await response.arrayBuffer();
        imageData = Buffer.from(buffer).toString('base64');
      } catch (error) {
        console.error('Firebase image fetch error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch image from Firebase URL' },
          { status: 400 }
        );
      }
    }

    if (!imageData) {
      return NextResponse.json(
        { error: 'Image data is required for editing' },
        { status: 400 }
      );
    }

    const numberOfImages = parseInt(settings?.outputs || '1');
    let generatedImages: string[] = [];

    // Image editing: put IMAGE FIRST, then the editing instruction
    let contents: any[] = [
      {
        inlineData: {
          mimeType: "image/png",
          data: imageData,
        },
      },
      { text: prompt } // Editing instruction comes after the image
    ];

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents: contents,
    });

    // Handle response structure properly - try multiple possible paths
    console.log('Full response structure:', JSON.stringify(response, null, 2));
    
    // Try different response structures
    if (response.response?.candidates) {
      for (const candidate of response.response.candidates) {
        if (candidate.content?.parts) {
          for (const part of candidate.content.parts) {
            if (part.inlineData?.data) {
              const generatedImageData = part.inlineData.data;
              const dataUrl = `data:image/png;base64,${generatedImageData}`;
              generatedImages.push(dataUrl);
            }
          }
        }
      }
    }
    
    // Also try direct response structure
    if (response.candidates) {
      for (const candidate of response.candidates) {
        if (candidate.content?.parts) {
          for (const part of candidate.content.parts) {
            if (part.inlineData?.data) {
              const generatedImageData = part.inlineData.data;
              const dataUrl = `data:image/png;base64,${generatedImageData}`;
              generatedImages.push(dataUrl);
            }
          }
        }
      }
    }

    if (generatedImages.length === 0) {
      throw new Error('No images were generated');
    }

    return NextResponse.json({
      success: true,
      images: generatedImages,
      metadata: {
        model: "gemini-2.5-flash-image-preview",
        prompt: prompt,
        hasInputImage: true,
        numberOfImages: generatedImages.length,
        mode: "edit"
      }
    });

  } catch (error) {
    console.error('Image editor API error:', error);
    return NextResponse.json(
      { error: 'Failed to process image: ' + (error as Error).message },
      { status: 500 }
    );
  }
}