import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error('Missing GEMINI_API_KEY environment variable');
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { action, prompt, script, base64Image, imageUrl, aspectRatio = '16:9' } = await request.json();

    switch (action) {
      case 'generateScript':
        if (!prompt) {
          return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        const response: GenerateContentResponse = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: `Based on the following idea, write a short film script. The script should be formatted correctly with scene headings, character names, and dialogue. Idea: "${prompt}"`,
          config: {
            systemInstruction: "You are an expert screenwriter. Your task is to generate a well-structured and creative short film script based on the user's prompt. Ensure standard screenplay format (scene headings, character dialogue, parentheticals, action lines)."
          }
        });

        return NextResponse.json({ success: true, script: response.text });

      case 'analyzeScript':
        if (!script) {
          return NextResponse.json({ error: 'Script is required' }, { status: 400 });
        }

        const analysisResponse = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: `Analyze the following film script and extract the requested information in JSON format.

          For the storyboard, create a detailed visual prompt for each distinct scene or major action beat. The prompt should be descriptive and suitable for an image generation model.

          For characters, list their names and a brief description based on their actions and dialogue.

          For locations, list the primary settings.

          For sound design, list key sound effects or music cues mentioned or implied.

          Script:
          ---
          ${script}
          ---
          `,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                storyboard: {
                  type: Type.ARRAY,
                  description: "An array of scenes, each with a scene number and a detailed visual prompt for image generation.",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      scene_number: { type: Type.INTEGER, description: "The sequential number of the scene." },
                      prompt: { type: Type.STRING, description: "A detailed visual prompt for generating the scene's image." }
                    },
                    required: ["scene_number", "prompt"],
                  }
                },
                characters: {
                  type: Type.ARRAY,
                  description: "An array of characters found in the script.",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING, description: "The character's name." },
                      description: { type: Type.STRING, description: "A brief description of the character." }
                    },
                    required: ["name", "description"],
                  }
                },
                locations: {
                  type: Type.ARRAY,
                  description: "An array of locations where the story takes place.",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING, description: "The location's name (e.g., INT. COFFEE SHOP)." },
                      description: { type: Type.STRING, description: "A brief description of the location's atmosphere or key features." }
                    },
                    required: ["name", "description"],
                  }
                },
                sound_design: {
                  type: Type.ARRAY,
                  description: "An array of key sound design elements.",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      scene_match: { type: Type.STRING, description: "Which scene(s) the sound applies to (e.g., 'Scene 1', 'Throughout')." },
                      description: { type: Type.STRING, description: "A description of the sound effect or music cue." }
                    },
                    required: ["scene_match", "description"],
                  }
                }
              },
            }
          }
        });

        const analysisData = JSON.parse(analysisResponse.text.trim());
        return NextResponse.json({ success: true, data: analysisData });

      case 'generateImage':
        console.log(`🎨 API: generateImage action received`)
        console.log(`📝 Prompt: "${prompt}"`)
        console.log(`📐 Aspect Ratio requested: ${aspectRatio}`)

        if (!prompt) {
          console.error(`❌ API: No prompt provided`)
          return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        const validAspectRatios = ["1:1", "16:9", "9:16", "4:3", "3:4"];
        const finalAspectRatio = validAspectRatios.includes(aspectRatio) ? aspectRatio : '16:9';
        console.log(`📐 Final aspect ratio: ${finalAspectRatio}`)

        const enhancedPrompt = `Cinematic film still, ${prompt}. High quality, detailed, professional cinematography.`;
        console.log(`✨ Enhanced prompt: "${enhancedPrompt}"`)

        console.log(`🚀 Making Gemini API call with imagen-4.0-generate-001...`)
        const imageResponse = await ai.models.generateImages({
          model: 'imagen-4.0-generate-001',
          prompt: enhancedPrompt,
          config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: finalAspectRatio,
          },
        });

        console.log(`📥 Gemini response received`)
        console.log(`🔍 Generated images count: ${imageResponse.generatedImages?.length || 0}`)

        if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0) {
          const base64ImageBytes: string = imageResponse.generatedImages[0].image.imageBytes;
          const dataUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
          console.log(`✅ API SUCCESS: Image generated (${base64ImageBytes.length} bytes)`)
          console.log(`🖼️ Data URL preview: ${dataUrl.substring(0, 50)}...`)
          return NextResponse.json({ success: true, imageUrl: dataUrl });
        }

        console.error(`❌ API: No image was generated by Gemini`)
        return NextResponse.json({ error: 'No image was generated' }, { status: 500 });

      case 'generateVideo':
        console.log('🎬 Video generation request:', { prompt, imageUrl: imageUrl ? 'present' : 'missing' });
        if (!prompt || !imageUrl) {
          console.error('❌ Missing required fields:', { prompt: !!prompt, imageUrl: !!imageUrl });
          return NextResponse.json({ error: 'Prompt and imageUrl are required' }, { status: 400 });
        }

        if (!process.env.REPLICATE_API_TOKEN) {
          return NextResponse.json({ error: 'Replicate API token not configured' }, { status: 500 });
        }

        const Replicate = require('replicate');
        const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

        // Use imageUrl directly if it's already a Firebase URL, or upload if it's base64
        let tempImageUrl = imageUrl;
        if (imageUrl.includes('base64,')) {
          const { uploadImageToStorage } = await import('@/services/filmService');
          tempImageUrl = await uploadImageToStorage(imageUrl, `kling_input_${Date.now()}.jpg`);
        }

        const input = {
          mode: "standard",
          prompt: prompt,
          duration: 5,
          start_image: tempImageUrl,
          negative_prompt: ""
        };

        const output = await replicate.run("kwaivgi/kling-v2.1", { input });

        if (output && typeof output.url === 'function') {
          const replicateVideoUrl = output.url();
          
          // Download video from Replicate
          const videoResponse = await fetch(replicateVideoUrl);
          if (!videoResponse.ok) {
            throw new Error(`Failed to download video from Replicate`);
          }
          const videoBlob = await videoResponse.blob();
          
          // Upload to Firebase Storage
          const { storage } = await import('@/lib/firebase');
          const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
          
          const timestamp = Date.now();
          const fileName = `story_video_${timestamp}.mp4`;
          const videoPath = `stories/${fileName}`;
          const videoRef = ref(storage, videoPath);
          await uploadBytes(videoRef, videoBlob);
          
          // Get permanent Firebase URL
          const firebaseVideoUrl = await getDownloadURL(videoRef);
          return NextResponse.json({ success: true, videoUrl: firebaseVideoUrl });
        }

        return NextResponse.json({ error: 'Video generation failed' }, { status: 500 });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Film API error:', error);
    return NextResponse.json({ error: 'API request failed' }, { status: 500 });
  }
}