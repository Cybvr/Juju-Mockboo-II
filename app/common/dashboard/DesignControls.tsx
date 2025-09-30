"use client";

import type React from "react";
import { useState, useEffect } from "react";
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
  Type,
} from "lucide-react";

interface DesignControlsProps {
  isGenerating?: boolean;
  initialPrompt?: string;
  onGenerate?: (params: {
    mode: "text";
    prompt: string;
    settings: {
      resolution: string;
      outputs: string;
    };
  }) => Promise<{ documentId?: string } | void>;
}

export function DesignControls({
  isGenerating = false,
  initialPrompt = "",
  onGenerate,
}: DesignControlsProps) {
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [outputs, setOutputs] = useState("1");
  const [prompt, setPrompt] = useState(initialPrompt);
  const [internalGenerating, setInternalGenerating] = useState(false);

  useEffect(() => {
    setPrompt(initialPrompt);
  }, [initialPrompt]);

  const handleGenerate = async () => {
    if (!onGenerate) return;

    // Validation
    if (!prompt.trim()) {
      console.error("Please enter a prompt for image generation");
      return;
    }

    setInternalGenerating(true);
    try {
      await onGenerate({
        mode: "text",
        prompt: prompt,
        settings: {
          resolution: aspectRatio,
          outputs,
        },
      });

      // Prompt persists - no clearing of the prompt state
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setInternalGenerating(false);
    }
  };

  return (
    <div className="space-y-4 mx-auto container items-center">
      <div className="rounded-xl p-3 border border-white/10 bg-background shadow-2xl">
        <div className="flex items-center gap-2 mb-3">
        </div>

        {/* Input Area */}
        <div className="w-full mb-3">
          <textarea
            className="w-full min-h-12 max-h-32 p-2 text-lg  bg-background rounded-md resize-none focus:outline-none overflow-y-auto"
            placeholder="Create image..."
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
            <Select value={aspectRatio} onValueChange={setAspectRatio}>
              <SelectTrigger className="h-8 text-xs w-auto border-none">
                <SelectValue placeholder="Aspect Ratio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1:1">Square (1:1)</SelectItem>
                <SelectItem value="4:3">Fullscreen (4:3)</SelectItem>
                <SelectItem value="3:4">Portrait (3:4)</SelectItem>
                <SelectItem value="16:9">Widescreen (16:9)</SelectItem>
                <SelectItem value="9:16">Portrait Wide (9:16)</SelectItem>
              </SelectContent>
            </Select>
            <Select value={outputs} onValueChange={setOutputs}>
              <SelectTrigger className="h-8 text-xs w-auto border-none">
                <SelectValue placeholder="Outputs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="8">8</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            size="sm"
            variant="outline"
            className="bg-white text-black"
            onClick={handleGenerate}
            disabled={isGenerating || internalGenerating || !prompt.trim()}
          >
            {(isGenerating || internalGenerating) ? (
              <div className="bg-white text-black" />
            ) : (
              <>
                <ArrowUp className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}