
import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 });
    }

    const { images } = await request.json();
    
    if (!images || !Array.isArray(images)) {
      return NextResponse.json({ error: 'Images array required' }, { status: 400 });
    }

    const imageUrls = [];

    for (let i = 0; i < images.length; i++) {
      const dataUrl = images[i];
      
      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      // Generate filename
      const timestamp = Date.now();
      const fileName = `upload-${timestamp}-${i}.${blob.type.split('/')[1]}`;
      const filePath = `galleries/${userId}/${fileName}`;
      
      // Upload to Firebase Storage
      const storageRef = ref(storage, filePath);
      await uploadBytes(storageRef, blob);
      
      // Get download URL
      const downloadUrl = await getDownloadURL(storageRef);
      imageUrls.push(downloadUrl);
    }

    return NextResponse.json({ imageUrls });
  } catch (error) {
    console.error('Failed to save images:', error);
    return NextResponse.json(
      { error: 'Failed to save images' },
      { status: 500 }
    );
  }
}
