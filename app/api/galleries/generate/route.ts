import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || ''
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, previousPrompt, aspectRatio = '1:1', outputs = 4, mode, referencePrompt } = await request.json();

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

    // Let AI figure out meaningful variations based on the prompt
    const scenePrompts = Array.from({ length: numOutputs }, (_, i) => 
      `${basePrompt}

This is image ${i + 1} of ${numOutputs} total images requested. Analyze what the user is asking for and generate meaningfully different interpretations. Think: what would make sense as distinct variations of this request? Create ONE single unified image that explores this concept differently from the other ${numOutputs - 1} variations.

Ensure each output is substantially different in a way that's relevant to the user's intent.`
    );

    // Run all image generations in parallel
    const responses = await Promise.all(
      scenePrompts.map(p =>
        genAI.models.generateImages({
          model: "imagen-4.0-generate-001",
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
