import type { FilmProject, StoryboardScene, Character, Location } from '@/types/storytypes';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface AnalyzedScriptData {
  storyboard: Array<{
    scene_number: number;
    prompt: string;
  }>;
  characters: Array<{
    name: string;
    description: string;
  }>;
  locations: Array<{
    name: string;
    description: string;
  }>;
  sound_design: Array<{
    scene_match: string;
    description: string;
  }>;
}

// Helper function to upload base64 image to Firebase Storage
export const uploadImageToStorage = async (base64Image: string, fileName: string): Promise<string> => {
  try {
    // Ensure proper data URL format
    const dataUrl = base64Image.startsWith('data:') 
      ? base64Image 
      : `data:image/jpeg;base64,${base64Image}`

    // Convert base64 to blob
    const response = await fetch(dataUrl)
    const blob = await response.blob()

    // Create storage reference
    const timestamp = Date.now()
    const storageRef = ref(storage, `stories/${timestamp}_${fileName}`)

    // Upload to Firebase Storage
    await uploadBytes(storageRef, blob)

    // Get download URL
    const downloadUrl = await getDownloadURL(storageRef)
    return downloadUrl
  } catch (error) {
    console.error('Failed to upload image to storage:', error)
    throw error
  }
}


/**
 * Generates a film script from a given prompt.
 */
export const generateScript = async (prompt: string): Promise<string> => {
  const response = await fetch('/api/stories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'generateScript',
      prompt,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate script');
  }

  const data = await response.json();
  return data.script;
};

/**
 * Generates a single image from a prompt and returns a Firebase Storage URL.
 */
export const generateSingleImage = async (prompt: string, aspectRatio: string = '16:9'): Promise<string> => {
  console.log(`🎯 generateSingleImage called with prompt: "${prompt}"`)
  console.log(`📐 Aspect ratio: ${aspectRatio}`)

  const response = await fetch('/api/stories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'generateImage',
      prompt,
      aspectRatio
    }),
  });

  console.log(`📥 API Response status: ${response.status} ${response.statusText}`)

  if (!response.ok) {
    console.error(`❌ API Error: HTTP ${response.status}: ${response.statusText}`)
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  console.log(`📦 API Response data:`, data)

  if (!data.success) {
    console.error(`❌ API returned failure:`, data.error)
    throw new Error(data.error || 'Image generation failed');
  }

  console.log(`🖼️ Base64 image received, uploading to Firebase Storage...`)

  // Upload base64 image to Firebase Storage and get URL
  const fileName = `scene_${Date.now()}.jpg`
  const storageUrl = await uploadImageToStorage(data.imageUrl, fileName)

  console.log(`☁️ Image uploaded to Firebase Storage: ${storageUrl}`)
  return storageUrl
}

/**
 * Analyzes a script and extracts storyboard scenes, characters, locations, and sound design.
 */
export const analyzeScript = async (script: string): Promise<AnalyzedScriptData> => {
  const response = await fetch('/api/stories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'analyzeScript',
      script,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to analyze script');
  }

  const result = await response.json();
  return result.data;
};

/**
 * Generates a video from a prompt and a base64 image, returning a data URL.
 */
export const generateVideo = async (prompt: string, base64Image: string): Promise<string> => {
  const response = await fetch('/api/stories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'generateVideo',
      prompt,
      base64Image,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate video');
  }

  const data = await response.json();
  return data.videoUrl;
};

/**
 * Generates a JSON patch (RFC 6902) to modify a film project based on a user's natural language command.
 */
export const generateProjectPatch = async (prompt: string, project: FilmProject): Promise<any[]> => {
  // This would also need to be moved to API route if used
  throw new Error('generateProjectPatch not implemented - move to API route if needed');
};


/**
 * Generates an image for a character and returns its Firebase Storage URL.
 */
export const generateCharacterImage = async (character: Character): Promise<string> => {
  const prompt = `Professional headshot of ${character.name}: ${character.description}. Portrait style, high quality.`
  const storageUrl = await generateSingleImage(prompt)
  console.log(`👤 Character image uploaded: ${character.name}`)
  return storageUrl
}

/**
 * Generates an image for a location and returns its Firebase Storage URL.
 */
export const generateLocationImage = async (location: Location): Promise<string> => {
  const prompt = `${location.name}: ${location.description}. Cinematic establishing shot, high quality.`
  const storageUrl = await generateSingleImage(prompt)
  console.log(`📍 Location image uploaded: ${location.name}`)
  return storageUrl
}