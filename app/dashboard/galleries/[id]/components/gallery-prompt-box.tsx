
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowUp } from 'lucide-react';

interface GalleryPromptBoxProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onGenerate: () => void;
  generating: boolean;
  generationMode: 'image' | 'video';
  onModeChange: (mode: 'image' | 'video') => void;
  videoSettings: {
    duration: number;
    resolution: string;
    aspectRatio: string;
  };
  onVideoSettingsChange: (settings: any) => void;
}

export function GalleryPromptBox({
  prompt,
  onPromptChange,
  onGenerate,
  generating,
  generationMode,
  onModeChange,
  videoSettings,
  onVideoSettingsChange
}: GalleryPromptBoxProps) {
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-3xl px-4 shadow-4xl">
      <div className="relative rounded-2xl border border-border bg-background shadow-lg focus-within:shadow-xl transition-shadow">
        <div className="relative">
          <Textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder={`Edit your prompt and generate ${generationMode === 'image' ? '4 more images' : '2 more videos'}...`}
            rows={3}
            className="resize-none text-base border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[100px] pl-3 pr-14 pb-12"
          />

          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <Button
              onClick={() => onModeChange(generationMode === 'image' ? 'video' : 'image')}
              size="sm"
              variant="outline"
              className="h-8 px-3 text-xs font-medium"
            >
              {generationMode === 'image' ? 'Image' : 'Video'}
            </Button>
            
            {generationMode === 'video' && (
              <>
                <select
                  value={videoSettings.duration}
                  onChange={(e) => onVideoSettingsChange({...videoSettings, duration: parseInt(e.target.value)})}
                  className="h-8 px-2 text-xs border border-border rounded bg-background"
                >
                  <option value={5}>5s</option>
                  <option value={10}>10s</option>
                </select>
                
                <select
                  value={videoSettings.resolution}
                  onChange={(e) => onVideoSettingsChange({...videoSettings, resolution: e.target.value})}
                  className="h-8 px-2 text-xs border border-border rounded bg-background"
                >
                  <option value="480p">480p</option>
                  <option value="1080p">1080p</option>
                </select>
                
                <select
                  value={videoSettings.aspectRatio}
                  onChange={(e) => onVideoSettingsChange({...videoSettings, aspectRatio: e.target.value})}
                  className="h-8 px-2 text-xs border border-border rounded bg-background"
                >
                  <option value="16:9">16:9</option>
                  <option value="9:16">9:16</option>
                  <option value="1:1">1:1</option>
                </select>
              </>
            )}
          </div>

          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <Button
              onClick={onGenerate}
              size="sm"
              className="h-8 w-8 p-0 rounded-lg bg-foreground hover:bg-foreground/90 text-background disabled:opacity-50 rounded-full"
              disabled={generating || !prompt.trim()}
            >
              {generating ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <ArrowUp className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
