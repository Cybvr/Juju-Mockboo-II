
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || ''
});

export async function POST(request: NextRequest) {
  try {
    const { image, outputs = 4, prompt = '' } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }

    let imageData = image;

    // Handle Firebase URL images (from document picker)
    if (image.startsWith('http')) {
      try {
        const response = await fetch(image);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`);
        }
        const buffer = await response.arrayBuffer();
        imageData = Buffer.from(buffer).toString('base64');
      } catch (error) {
        console.error('Image fetch error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch image from URL' },
          { status: 400 }
        );
      }
    }

    // Strip data URL prefix if present (data:image/jpeg;base64,)
    if (imageData.startsWith('data:')) {
      const base64Index = imageData.indexOf(',');
      if (base64Index !== -1) {
        imageData = imageData.substring(base64Index + 1);
      }
    }

    const results = [];
    const numOutputs = parseInt(outputs.toString());

    for (let i = 0; i < numOutputs; i++) {
      try {
        // Use proper image generation with text + image input
        const promptParts = [
          {
            text: prompt || "Create a professional design variation of this image, maintaining the core elements while adding creative enhancements"
          },
          {
            inlineData: {
              mimeType: "image/png",
              data: imageData,
            },
          }
        ];

        const response = await genAI.models.generateContent({
          model: "gemini-2.5-flash-image-preview",
          contents: promptParts,
        });

        if (response.candidates && response.candidates.length > 0) {
          const candidate = response.candidates[0];
          if (candidate.content && candidate.content.parts) {
            for (const part of candidate.content.parts) {
              if (part.inlineData) {
                const generatedImageData = part.inlineData.data;
                const dataUrl = `data:image/png;base64,${generatedImageData}`;

                results.push({
                  url: dataUrl,
                  prompt: prompt,
                  id: `multiply_${Date.now()}_${i}`
                });
                break;
              }
            }
          }
        }
      } catch (error) {
        console.error(`Failed to generate multiply ${i + 1}:`, error);
      }
    }

    if (results.length === 0) {
      throw new Error('Failed to generate any multiplies');
    }

    return NextResponse.json({
      success: true,
      multiplies: results,
      count: results.length
    });

  } catch (error) {
    console.error('Multiply generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate multiplies: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
