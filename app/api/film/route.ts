
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error('Missing GEMINI_API_KEY environment variable');
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { action, prompt, script, base64Image, aspectRatio = '16:9' } = await request.json();

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
        if (!prompt) {
          return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        const validAspectRatios = ["1:1", "16:9", "9:16", "4:3", "3:4"];
        const finalAspectRatio = validAspectRatios.includes(aspectRatio) ? aspectRatio : '16:9';

        const imageResponse = await ai.models.generateImages({
          model: 'imagen-4.0-generate-001',
          prompt: `Cinematic film still, ${prompt}. High quality, detailed, professional cinematography.`,
          config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: finalAspectRatio,
          },
        });

        if (imageResponse.generatedImages && imageResponse.generatedImages.length > 0) {
          const base64ImageBytes: string = imageResponse.generatedImages[0].image.imageBytes;
          const dataUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
          return NextResponse.json({ success: true, imageUrl: dataUrl });
        }

        return NextResponse.json({ error: 'No image was generated' }, { status: 500 });

      case 'generateVideo':
        if (!prompt || !base64Image) {
          return NextResponse.json({ error: 'Prompt and base64Image are required' }, { status: 400 });
        }

        let operation = await ai.models.generateVideos({
          model: 'veo-2.0-generate-001',
          prompt,
          image: {
            imageBytes: base64Image,
            mimeType: 'image/jpeg',
          },
          config: {
            numberOfVideos: 1,
          }
        });

        while (!operation.done) {
          await new Promise(resolve => setTimeout(resolve, 10000));
          operation = await ai.operations.getVideosOperation({ operation: operation });
        }
        
        if (operation.response?.generatedVideos?.[0]?.video?.uri) {
          const downloadLink = operation.response.generatedVideos[0].video.uri;
          const videoResponse = await fetch(`${downloadLink}&key=${process.env.GEMINI_API_KEY}`);
          if (!videoResponse.ok) {
            throw new Error(`Failed to fetch video: ${videoResponse.statusText}`);
          }
          const videoBlob = await videoResponse.blob();
          const buffer = await videoBlob.arrayBuffer();
          const base64Video = Buffer.from(buffer).toString('base64');
          return NextResponse.json({ success: true, videoUrl: `data:video/mp4;base64,${base64Video}` });
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
