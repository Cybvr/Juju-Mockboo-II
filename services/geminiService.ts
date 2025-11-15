
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import sharp from 'sharp';

// Helper to get intrinsic image dimensions from a File object using sharp
const getImageDimensions = async (file: File): Promise<{ width: number; height: number }> => {
    const buffer = Buffer.from(await file.arrayBuffer());
    const metadata = await sharp(buffer).metadata();
    
    if (!metadata.width || !metadata.height) {
        throw new Error("Could not determine image dimensions");
    }
    
    return { width: metadata.width, height: metadata.height };
};

// Helper to crop a square image back to an original aspect ratio, removing padding.
const cropToOriginalAspectRatio = async (
    imageDataUrl: string,
    originalWidth: number,
    originalHeight: number,
    targetDimension: number
): Promise<string> => {
    // Remove data URL prefix to get base64 data
    const base64Data = imageDataUrl.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Re-calculate the dimensions of the content area within the padded square image
    const aspectRatio = originalWidth / originalHeight;
    let contentWidth, contentHeight;
    if (aspectRatio > 1) { // Landscape
        contentWidth = targetDimension;
        contentHeight = targetDimension / aspectRatio;
    } else { // Portrait or square
        contentHeight = targetDimension;
        contentWidth = targetDimension * aspectRatio;
    }

    // Calculate the top-left offset of the content area
    const x = Math.round((targetDimension - contentWidth) / 2);
    const y = Math.round((targetDimension - contentHeight) / 2);

    // Extract the content area and resize to final dimensions
    const croppedBuffer = await sharp(buffer)
        .extract({ 
            left: x, 
            top: y, 
            width: Math.round(contentWidth), 
            height: Math.round(contentHeight) 
        })
        .jpeg({ quality: 95 })
        .toBuffer();
    
    // Return as data URL
    const croppedBase64 = croppedBuffer.toString('base64');
    return `data:image/jpeg;base64,${croppedBase64}`;
};

// New resize logic to enforce a consistent aspect ratio without cropping.
const resizeImage = async (file: File, targetDimension: number): Promise<File> => {
    const buffer = Buffer.from(await file.arrayBuffer());
    const metadata = await sharp(buffer).metadata();
    
    if (!metadata.width || !metadata.height) {
        throw new Error("Could not determine image dimensions");
    }

    // Calculate new dimensions to fit inside the square canvas while maintaining aspect ratio
    const aspectRatio = metadata.width / metadata.height;
    let newWidth, newHeight;

    if (aspectRatio > 1) { // Landscape image
        newWidth = targetDimension;
        newHeight = Math.round(targetDimension / aspectRatio);
    } else { // Portrait or square image
        newHeight = targetDimension;
        newWidth = Math.round(targetDimension * aspectRatio);
    }

    // Create a square canvas with black background and center the resized image
    const resizedBuffer = await sharp(buffer)
        .resize(newWidth, newHeight)
        .extend({
            top: Math.round((targetDimension - newHeight) / 2),
            bottom: Math.round((targetDimension - newHeight) / 2),
            left: Math.round((targetDimension - newWidth) / 2),
            right: Math.round((targetDimension - newWidth) / 2),
            background: { r: 0, g: 0, b: 0, alpha: 1 }
        })
        .jpeg({ quality: 95 })
        .toBuffer();

    return new File([resizedBuffer], file.name, {
        type: 'image/jpeg',
        lastModified: Date.now()
    });
};

// Helper function to convert a File object to a Gemini API Part
const fileToPart = async (file: File): Promise<{ inlineData: { mimeType: string; data: string; } }> => {
    const buffer = Buffer.from(await file.arrayBuffer());
    const data = buffer.toString('base64');
    
    return { 
        inlineData: { 
            mimeType: file.type || 'image/jpeg', 
            data 
        } 
    };
};

// Helper to convert File to a data URL string
const fileToDataUrl = async (file: File): Promise<string> => {
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString('base64');
    const mimeType = file.type || 'image/jpeg';
    return `data:${mimeType};base64,${base64}`;
};

// Helper to draw a marker on an image and return a new File object
const markImage = async (
    paddedSquareFile: File, 
    position: { xPercent: number; yPercent: number; },
    originalDimensions: { originalWidth: number; originalHeight: number; }
): Promise<File> => {
    const buffer = Buffer.from(await paddedSquareFile.arrayBuffer());
    const metadata = await sharp(buffer).metadata();
    
    if (!metadata.width || !metadata.height) {
        throw new Error("Could not determine image dimensions for marking");
    }
    
    const targetDimension = metadata.width;

    // Recalculate the content area's dimensions and offset within the padded square canvas.
    const { originalWidth, originalHeight } = originalDimensions;
    const aspectRatio = originalWidth / originalHeight;
    let contentWidth, contentHeight;

    if (aspectRatio > 1) { // Landscape
        contentWidth = targetDimension;
        contentHeight = targetDimension / aspectRatio;
    } else { // Portrait or square
        contentHeight = targetDimension;
        contentWidth = targetDimension * aspectRatio;
    }
    
    const offsetX = (targetDimension - contentWidth) / 2;
    const offsetY = (targetDimension - contentHeight) / 2;

    // Calculate the marker's coordinates relative to the actual image content
    const markerXInContent = (position.xPercent / 100) * contentWidth;
    const markerYInContent = (position.yPercent / 100) * contentHeight;

    // The final position on the canvas is the content's offset plus the relative position
    const finalMarkerX = Math.round(offsetX + markerXInContent);
    const finalMarkerY = Math.round(offsetY + markerYInContent);

    // Make radius proportional to image size, but with a minimum
    const markerRadius = Math.max(5, Math.min(targetDimension, targetDimension) * 0.015);

    // Create SVG for the marker (red circle with white outline)
    const svgMarker = `
        <svg width="${targetDimension}" height="${targetDimension}">
            <circle cx="${finalMarkerX}" cy="${finalMarkerY}" r="${markerRadius}" 
                    fill="red" stroke="white" stroke-width="${markerRadius * 0.2}"/>
        </svg>
    `;

    // Composite the marker onto the image
    const markedBuffer = await sharp(buffer)
        .composite([{
            input: Buffer.from(svgMarker),
            top: 0,
            left: 0
        }])
        .jpeg({ quality: 95 })
        .toBuffer();

    return new File([markedBuffer], `marked-${paddedSquareFile.name}`, {
        type: 'image/jpeg',
        lastModified: Date.now()
    });
};

/**
 * Generates a composite image using a multi-modal AI model.
 * The model takes a product image, a scene image, and a text prompt
 * to generate a new image with the product placed in the scene.
 * @param objectImage The file for the object to be placed.
 * @param objectDescription A text description of the object.
 * @param environmentImage The file for the background environment.
 * @param environmentDescription A text description of the environment.
 * @param dropPosition The relative x/y coordinates (0-100) where the product was dropped.
 * @returns A promise that resolves to an object containing the base64 data URL of the generated image and the debug image.
 */
export const generateCompositeImage = async (
    objectImage: File, 
    objectDescription: string,
    environmentImage: File,
    environmentDescription: string,
    dropPosition: { xPercent: number; yPercent: number; }
): Promise<{ finalImageUrl: string; debugImageUrl: string; finalPrompt: string; }> => {
  console.log('Starting multi-step image generation process...');
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  // Get original scene dimensions for final cropping and correct marker placement
  const { width: originalWidth, height: originalHeight } = await getImageDimensions(environmentImage);
  
  // Define standard dimension for model inputs
  const MAX_DIMENSION = 1024;
  
  // STEP 1: Prepare images by resizing
  console.log('Resizing product and scene images...');
  const resizedObjectImage = await resizeImage(objectImage, MAX_DIMENSION);
  const resizedEnvironmentImage = await resizeImage(environmentImage, MAX_DIMENSION);

  // STEP 2: Mark the resized scene image for the description model and debug view
  console.log('Marking scene image for analysis...');
  // Pass original dimensions to correctly calculate marker position on the padded image
  const markedResizedEnvironmentImage = await markImage(resizedEnvironmentImage, dropPosition, { originalWidth, originalHeight });

  // The debug image is now the marked one.
  const debugImageUrl = await fileToDataUrl(markedResizedEnvironmentImage);

  // STEP 3: Generate semantic location description with Gemini 2.5 Flash Lite using the MARKED image
  console.log('Generating semantic location description with gemini-2.5-flash-lite...');
  
  const markedEnvironmentImagePart = await fileToPart(markedResizedEnvironmentImage);

  const descriptionPrompt = `
You are an expert scene analyst. I will provide you with an image that has a red marker on it.
Your task is to provide a very dense, semantic description of what is at the exact location of the red marker.
Be specific about surfaces, objects, and spatial relationships. This description will be used to guide another AI in placing a new object.

Example semantic descriptions:
- "The product location is on the dark grey fabric of the sofa cushion, in the middle section, slightly to the left of the white throw pillow."
- "The product location is on the light-colored wooden floor, in the patch of sunlight coming from the window, about a foot away from the leg of the brown leather armchair."
- "The product location is on the white marble countertop, just to the right of the stainless steel sink and behind the green potted plant."

On top of the semantic description above, give a rough relative-to-image description.

Example relative-to-image descriptions:
- "The product location is about 10% away from the bottom-left of the image."
- "The product location is about 20% away from the right of the image."

Provide only the two descriptions concatenated in a few sentences.
`;
  
  let semanticLocationDescription = '';
  try {
    const descriptionResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: { parts: [{ text: descriptionPrompt }, markedEnvironmentImagePart] }
    });
    semanticLocationDescription = descriptionResponse.text;
    console.log('Generated description:', semanticLocationDescription);
  } catch (error) {
    console.error('Failed to generate semantic location description:', error);
    // Fallback to a generic statement if the description generation fails
    semanticLocationDescription = `at the specified location.`;
  }

  // STEP 4: Generate composite image using the CLEAN image and the description
  console.log('Preparing to generate composite image...');
  
  const objectImagePart = await fileToPart(resizedObjectImage);
  const cleanEnvironmentImagePart = await fileToPart(resizedEnvironmentImage); // IMPORTANT: Use clean image
  
  const prompt = `
**Role:**
You are a visual composition expert. Your task is to take a 'product' image and seamlessly integrate it into a 'scene' image, adjusting for perspective, lighting, and scale.

**Specifications:**
-   **Product to add:**
    The first image provided. It may be surrounded by black padding or background, which you should ignore and treat as transparent and only keep the product.
-   **Scene to use:**
    The second image provided. It may also be surrounded by black padding, which you should ignore.
-   **Placement Instruction (Crucial):**
    -   You must place the product at the location described below exactly. You should only place the product once. Use this dense, semantic description to find the exact spot in the scene.
    -   **Product location Description:** "${semanticLocationDescription}"
-   **Final Image Requirements:**
    -   The output image's style, lighting, shadows, reflections, and camera perspective must exactly match the original scene.
    -   Do not just copy and paste the product. You must intelligently re-render it to fit the context. Adjust the product's perspective and orientation to its most natural position, scale it appropriately, and ensure it casts realistic shadows according to the scene's light sources.
    -   The product must have proportional realism. For example, a lamp product can't be bigger than a sofa in scene.
    -   You must not return the original scene image without product placement. The product must be always present in the composite image.

The output should ONLY be the final, composed image. Do not add any text or explanation.
`;

  const textPart = { text: prompt };
  
  console.log('Sending images and augmented prompt...');
  
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: { parts: [objectImagePart, cleanEnvironmentImagePart, textPart] }, // IMPORTANT: Use clean image
  });

  console.log('Received response.');
  
  const imagePartFromResponse = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

  if (imagePartFromResponse?.inlineData) {
    const { mimeType, data } = imagePartFromResponse.inlineData;
    console.log(`Received image data (${mimeType}), length:`, data.length);
    const generatedSquareImageUrl = `data:${mimeType};base64,${data}`;
    
    console.log('Cropping generated image to original aspect ratio...');
    const finalImageUrl = await cropToOriginalAspectRatio(
        generatedSquareImageUrl,
        originalWidth,
        originalHeight,
        MAX_DIMENSION
    );
    
    return { finalImageUrl, debugImageUrl, finalPrompt: prompt };
  }

  console.error("Model response did not contain an image part.", response);
  throw new Error("The AI model did not return an image. Please try again.");
};
