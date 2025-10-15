
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import type { FilmProject, StoryboardScene, Character, Location, SoundDesign } from '@/types/storytypes';

if (!process.env.NEXT_PUBLIC_API_KEY) {
    // This is a placeholder check; in a real app, this should be handled more robustly.
    // For this project, we assume NEXT_PUBLIC_API_KEY is always available.
    console.warn("NEXT_PUBLIC_API_KEY environment variable is not set. API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_API_KEY });

/**
 * Generates a film script from a given prompt.
 */
export const generateScript = async (prompt: string): Promise<string> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: `Based on the following idea, write a short film script. The script should be formatted correctly with scene headings, character names, and dialogue. Idea: "${prompt}"`,
            config: {
                systemInstruction: "You are an expert screenwriter. Your task is to generate a well-structured and creative short film script based on the user's prompt. Ensure standard screenplay format (scene headings, character dialogue, parentheticals, action lines)."
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating script:", error);
        throw new Error("Failed to generate script. Please try again.");
    }
};

/**
 * Generates a single image from a prompt and returns a base64 data URL.
 */
export const generateSingleImage = async (prompt: string, aspectRatio: string = '16:9'): Promise<string> => {
    try {
        const validAspectRatios = ["1:1", "16:9", "9:16", "4:3", "3:4"];
        const finalAspectRatio = validAspectRatios.includes(aspectRatio) ? aspectRatio : '16:9';

        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `Cinematic film still, ${prompt}. High quality, detailed, professional cinematography.`,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: finalAspectRatio,
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            throw new Error("No image was generated.");
        }
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to generate image. The prompt may have been rejected.");
    }
};

interface AnalyzedScriptData {
    storyboard: Omit<StoryboardScene, 'id' | 'imageUrl' | 'generating' | 'videoUrl' | 'videoGenerating'>[];
    characters: Omit<Character, 'id'>[];
    locations: Omit<Location, 'id'>[];
    sound_design: Omit<SoundDesign, 'id'>[];
}


/**
 * Analyzes a script and extracts storyboard scenes, characters, locations, and sound design.
 */
export const analyzeScript = async (script: string): Promise<AnalyzedScriptData> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
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

        const jsonStr = response.text.trim();
        const parsedData = JSON.parse(jsonStr);
        
        if (!parsedData.storyboard || !parsedData.characters || !parsedData.locations || !parsedData.sound_design) {
            throw new Error("AI response is missing required fields.");
        }

        return parsedData as AnalyzedScriptData;

    } catch (error) {
        console.error("Error analyzing script:", error);
        if (error instanceof SyntaxError) {
             throw new Error("Failed to parse AI response as JSON. The model may have returned an invalid format.");
        }
        throw new Error("Failed to analyze script. Please try again.");
    }
};

/**
 * Generates a video from a prompt and a base64 image, returning an object URL.
 */
export const generateVideo = async (prompt: string, base64Image: string): Promise<string> => {
    try {
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
            const videoResponse = await fetch(`${downloadLink}&key=${process.env.NEXT_PUBLIC_API_KEY}`);
            if (!videoResponse.ok) {
                throw new Error(`Failed to fetch video: ${videoResponse.statusText}`);
            }
            const videoBlob = await videoResponse.blob();
            return URL.createObjectURL(videoBlob);
        } else {
            throw new Error('Video generation finished, but no video URI was found.');
        }

    } catch (error) {
        console.error("Error generating video:", error);
        throw new Error("Failed to generate video.");
    }
};


/**
 * Generates a JSON patch (RFC 6902) to modify a film project based on a user's natural language command.
 */
export const generateProjectPatch = async (prompt: string, project: FilmProject): Promise<any[]> => {
    try {
        const systemInstruction = `You are an AI assistant that modifies a JSON object representing a film project based on user commands. Your task is to generate a JSON array of patch operations according to RFC 6902 (JSON Patch) to apply the requested changes. Respond ONLY with the raw JSON array. Do not include markdown formatting like \`\`\`json. For adding to an array, use the path with a hyphen \`-\` to append. For new items, create a unique ID, for example using the current timestamp like \`scene_\${Date.now()}\`. New items must have all required fields as seen in other items of the same type in the JSON.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: `User command: "${prompt}"\n\nProject JSON:\n${JSON.stringify(project, null, 2)}`,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
            }
        });
        
        const jsonStr = response.text.trim();
        const cleanedJsonStr = jsonStr.replace(/^```json\n/, '').replace(/\n```$/, '');
        const patch = JSON.parse(cleanedJsonStr);
        
        if (!Array.isArray(patch)) {
            throw new Error("AI did not return a valid JSON patch array.");
        }

        return patch;

    } catch (error) {
        console.error("Error generating project patch:", error);
        if (error instanceof SyntaxError) {
             throw new Error("Failed to parse AI response as JSON. The model may have returned an invalid format.");
        }
        throw new Error("Failed to process chat command. Please try again.");
    }
};
