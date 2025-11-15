
"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUp,
  Plus,
  X,
} from "lucide-react";

interface VideoControlsProps {
  onGenerate: (params: {
    prompt: string;
    first_frame_image?: string;
    duration: number;
    prompt_optimizer: boolean;
  }) => Promise<{ documentId?: string } | void>;
  isGenerating?: boolean;
}

export function VideoControls({ onGenerate, isGenerating = false }: VideoControlsProps) {
  const [prompt, setPrompt] = useState('');
  const [firstFrameImage, setFirstFrameImage] = useState('');
  const [duration, setDuration] = useState(6);
  const [promptOptimizer, setPromptOptimizer] = useState(true);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFirstFrameImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setFirstFrameImage('');
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      console.log('⚠️ VideoControls: No prompt provided, skipping generation');
      return;
    }

    console.log('🎮 VideoControls: Starting video generation...');
    console.log('📝 VideoControls: Prompt:', prompt.trim());

    const params: any = {
      prompt: prompt.trim(),
      duration,
      prompt_optimizer: promptOptimizer,
    };

    // Only include first_frame_image if it exists
    if (firstFrameImage) {
      params.first_frame_image = firstFrameImage;
      console.log('🖼️ VideoControls: Including first frame image');
    }

    console.log('🚀 VideoControls: Generation params:', params);

    try {
      console.log('📞 VideoControls: Calling onGenerate function...');
      const result = await onGenerate(params);
      
      console.log('📋 VideoControls: Generation result:', result);
      
      // If generation returns a document ID, redirect to media view
      if (result?.documentId) {
        console.log('✅ VideoControls: Document created with ID:', result.documentId);
        console.log('🔄 VideoControls: Redirecting to media view...');
        window.location.href = `/m/${result.documentId}`;
      } else {
        console.log('⚠️ VideoControls: No document ID returned from generation');
        console.log('🔍 VideoControls: Full result object:', result);
      }
    } catch (error) {
      console.error('❌ VideoControls: Video generation failed:', error);
    }
  };

  return (
    <div className="space-y-4 mx-auto container max-w-4xl items-center">
      <div className="rounded-xl p-3 border border-white/10 bg-background shadow-2xl">
        {/* Uploaded Image Display (if any) */}
        {uploadedImage && (
          <div className="mb-3 p-2 border rounded-md bg-muted/20">
            <div className="flex items-center gap-2">
              <img
                src={firstFrameImage}
                alt="First frame"
                className="w-8 h-8 object-cover rounded"
              />
              <span className="text-sm text-muted-foreground truncate flex-1">{uploadedImage.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveImage}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-none">
          <textarea
            className="w-full min-h-12 max-h-32 p-2 text-lg  bg-background rounded-md resize-none focus:outline-none overflow-y-auto"
            placeholder="Create video  ..."
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              // Auto-resize textarea with max height
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleGenerate();
              }
            }}
          />
        </div>

        {/* Settings and Generate Button */}
        <div className="flex items-end gap-3">
          <div className="flex gap-2 flex-1">
            {/* Upload Button */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs"
                type="button"
              >
                <Plus className="h-3 w-3" />
              </Button>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
              <SelectTrigger className="h-8 text-xs w-auto min-w-[100px] border-none">
                <SelectValue placeholder="Duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 seconds</SelectItem>
                <SelectItem value="10">10 seconds</SelectItem>
              </SelectContent>
            </Select>

          </div>
          <Button
            size="sm"
            variant="outline"
            className="bg-white text-black"
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
