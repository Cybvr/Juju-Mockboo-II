import type { FilmProject } from '@/types/storytypes';

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
 * Generates a single image from a prompt and returns a base64 data URL.
 */
export async function generateSingleImage(prompt: string, aspectRatio: string = '16:9'): Promise<string> {
  console.log(`📡 generateSingleImage: Making API call to /api/stories`)
  console.log(`📝 Prompt: "${prompt}"`)
  console.log(`📐 Aspect Ratio: ${aspectRatio}`)

  const requestBody = {
    action: 'generateImage',
    prompt,
    aspectRatio
  };

  console.log(`📤 Request body:`, requestBody)

  const response = await fetch('/api/stories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
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

  console.log(`✅ generateSingleImage SUCCESS - Got imageUrl: ${data.imageUrl ? data.imageUrl.substring(0, 100) + '...' : 'null'}`)
  return data.imageUrl;
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