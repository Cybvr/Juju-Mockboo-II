import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';


interface AIPromptGeneratorProps {
  selectedImages?: string[];
  onImageGenerated?: (imageUrl: string) => void;
  onGenerationStart?: () => void;
  onGenerationEnd?: () => void;
}

export default function AIPromptGenerator({ selectedImages = [], onImageGenerated, onGenerationStart, onGenerationEnd }: AIPromptGeneratorProps) {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim() || !user || isGenerating) return;

    setIsGenerating(true);
    if (onGenerationStart) onGenerationStart();

    try {
      const settings = {
        model: "gemini-2.5-flash-image-preview",
        aspectRatio: "1:1",
        outputs: "1"
      };

      console.log('ChatterBox: Making API request with settings:', settings);

      // Handle different scenarios based on selected images
      let apiEndpoint = '/api/generate';
      let requestBody: any = {
        prompt,
        settings,
        mode: 'text'
      };

      if (selectedImages.length === 1) {
        // Single image editing
        apiEndpoint = '/api/image-editor';
        requestBody = {
          prompt,
          settings: {
            ...settings,
            firebaseUrl: selectedImages[0]
          }
        };
      } else if (selectedImages.length === 2) {
        // Image fusion
        apiEndpoint = '/api/fuse-images';
        
        // Convert Firebase URLs to base64
        const [imageAResponse, imageBResponse] = await Promise.all([
          fetch(selectedImages[0]),
          fetch(selectedImages[1])
        ]);
        
        const [imageABuffer, imageBBuffer] = await Promise.all([
          imageAResponse.arrayBuffer(),
          imageBResponse.arrayBuffer()
        ]);
        
        const imageABase64 = Buffer.from(imageABuffer).toString('base64');
        const imageBBase64 = Buffer.from(imageBBuffer).toString('base64');
        
        requestBody = {
          imageA: imageABase64,
          imageB: imageBBase64,
          prompt
        };
      } else if (selectedImages.length > 2) {
        alert('Please select up to 2 images for fusion or 1 image for editing');
        setIsGenerating(false);
        return;
      }

      console.log('ChatterBox: Using API endpoint:', apiEndpoint);
      console.log('ChatterBox: Request body:', requestBody);

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(selectedImages.length === 0 && { 'x-user-id': user.uid }),
        },
        body: JSON.stringify(requestBody),
      });


      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();

      if (data.images && data.images.length > 0) {
        const imageUrl = data.images[0]; // Take the first generated image
        console.log('ChatterBox: Generated image URL:', imageUrl.substring(0, 100) + '...');

        // Return generated image URL to parent - let parent handle storage/canvas decisions
        if (onImageGenerated) {
          console.log('ChatterBox: Returning generated image to parent...');
          onImageGenerated(imageUrl);
        } else {
          console.warn('ChatterBox: No onImageGenerated callback provided');
        }

        // Clear prompt after successful generation
        setPrompt("");
      } else {
        console.error('ChatterBox: No images generated in response', data);
      }
    } catch (error) {
      console.error('Failed to generate image:', error);
    } finally {
      setIsGenerating(false);
      if (onGenerationEnd) onGenerationEnd();
    }
  };

  return (
    <div className="w-full p-2 bg-card rounded-2xl">
      <div className="space-y-4">
        {/* Selected Images Display */}
        {selectedImages.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {selectedImages.map((imageUrl, index) => (
              <div key={index} className="relative">
                <img
                  src={imageUrl}
                  alt={`Selected ${index + 1}`}
                  className="w-16 h-16 object-cover rounded border"
                />
                <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {selectedImages.length}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-stretch justify-between gap-4">
          {/* Left side - Prompt and controls */}
          <div className="flex-1 space-y-4">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                selectedImages.length === 0 ? "What do you want to create?" :
                selectedImages.length === 1 ? "Describe what you want to do with the selected image..." :
                selectedImages.length === 2 ? "Describe how you want to fuse these two images..." :
                "Select up to 2 images for fusion or 1 for editing"
              }
              className="min-h-[68px] resize-none bg-card text-foreground text-lg"
            />
          </div>
          {/* Right side - Generate button */}
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="bg-primary text-foreground font-normal h-full"
          >
            <div className="flex items-center rounded-full">
              {isGenerating ? (
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}