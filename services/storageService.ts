import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export class StorageService {

  async uploadImage(userId: string, imageData: string, filename?: string): Promise<string> {
    try {
      let blob: Blob;

      // Check if imageData is a URL or base64 data
      if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
        // It's a URL, fetch the image
        const response = await fetch(imageData);
        if (!response.ok) {
          throw new Error(`Failed to fetch image from URL: ${response.status}`);
        }
        blob = await response.blob();
      } else {
        // It's base64 data, convert to blob
        const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);

        // Detect file type from data URL
        const mimeType = imageData.match(/data:([^;]+);/)?.[1] || 'image/png';
        blob = new Blob([byteArray], { type: mimeType });
      }

      // Create unique filename
      const timestamp = Date.now();
      const isVideo = blob.type.startsWith('video/');
      const defaultExt = isVideo ? 'mp4' : 'png';
      const folder = isVideo ? 'videos' : 'images';
      const filePrefix = isVideo ? 'video' : 'image';

      const fileName = filename || `${filePrefix}-${timestamp}.${defaultExt}`;
      const filePath = `users/${userId}/${folder}/${fileName}`;

      // Upload to Firebase Storage
      const fileRef = ref(storage, filePath);
      await uploadBytes(fileRef, blob);

      // Get download URL
      const downloadURL = await getDownloadURL(fileRef);
      return downloadURL;

    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image to storage');
    }
  }

  async uploadMultipleImages(userId: string, imageDataArray: string[]): Promise<string[]> {
    const uploadPromises = imageDataArray.map((imageData, index) => 
      this.uploadImage(userId, imageData, `image-${Date.now()}-${index}.png`)
    );

    return Promise.all(uploadPromises);
  }

  async uploadImages(imageDataArray: string[], userId: string): Promise<string[]> {
    const uploadPromises = imageDataArray.map((imageData, index) => 
      this.uploadImage(userId, imageData, `image-${Date.now()}-${index}.png`)
    );

    return Promise.all(uploadPromises);
  }

  async uploadImageFromUrl(imageData: string, userId: string): Promise<string> {
    console.log('StorageService: uploadImageFromUrl called with userId:', userId);
    console.log('StorageService: imageData type:', typeof imageData, 'starts with data:', imageData.startsWith('data:'));
    
    try {
      const result = await this.uploadImage(userId, imageData);
      console.log('StorageService: Upload successful, URL:', result);
      return result;
    } catch (error) {
      console.error('StorageService: Upload failed:', error);
      throw error;
    }
  }

  async uploadVideo(userId: string, videoFile: File, filename?: string): Promise<string> {
    try {
      // Create unique filename
      const timestamp = Date.now();
      const fileName = filename || `video-${timestamp}.mp4`;
      const filePath = `users/${userId}/videos/${fileName}`;

      // Upload to Firebase Storage
      const fileRef = ref(storage, filePath);
      await uploadBytes(fileRef, videoFile);

      // Get download URL
      const downloadURL = await getDownloadURL(fileRef);
      return downloadURL;

    } catch (error) {
      console.error('Error uploading video:', error);
      throw new Error('Failed to upload video to storage');
    }
  }

  // Upload audio file (base64 data URL)
  async uploadAudio(userId: string, audioDataUrl: string): Promise<string> {
    const audioRef = ref(storage, `audio/${userId}/${Date.now()}.mp3`);

    // Convert data URL to blob
    const response = await fetch(audioDataUrl);
    const blob = await response.blob();

    await uploadBytes(audioRef, blob);
    return await getDownloadURL(audioRef);
  }

  // Download image utility (for client-side usage)
  async downloadImage(imageUrl: string, filename: string): Promise<void> {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
      // Fallback: open in new tab
      window.open(imageUrl, '_blank');
    }
  }
}

export const storageService = new StorageService();