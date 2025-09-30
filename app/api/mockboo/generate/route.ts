
import { NextRequest, NextResponse } from 'next/server';
import { generateCompositeImage } from '@/services/geminiService';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const objectImage = formData.get('objectImage') as File;
    const objectDescription = formData.get('objectDescription') as string;
    const environmentImage = formData.get('environmentImage') as File;
    const environmentDescription = formData.get('environmentDescription') as string;
    const dropPosition = JSON.parse(formData.get('dropPosition') as string);

    if (!objectImage || !objectDescription || !environmentImage || !environmentDescription || !dropPosition) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await generateCompositeImage(
      objectImage,
      objectDescription,
      environmentImage,
      environmentDescription,
      dropPosition
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Mockboo generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json(
      { error: `Failed to generate the image. ${errorMessage}` },
      { status: 500 }
    );
  }
}
