'use client';
import { Button } from '@/components/ui/button';
import { Send, Loader2, ArrowUp, Plus, Upload, X, Image } from 'lucide-react';
import { useState, useRef } from 'react';

interface ChatControlsProps {
  currentMessage: string;
  setCurrentMessage: (message: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isTyping: boolean;
  onImageUpload?: (file: File) => void;
  onGenerateImage?: (prompt: string) => void;
  uploadedImage?: File | null;
  onRemoveImage?: () => void;
}

export default function ChatControls({
  currentMessage,
  setCurrentMessage,
  onSendMessage,
  onKeyPress,
  isTyping,
  onImageUpload,
  onGenerateImage,
  uploadedImage,
  onRemoveImage
}: ChatControlsProps) {
  const [showImageOptions, setShowImageOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImageUpload) {
      onImageUpload(file);
      setShowImageOptions(false);
    }
  };

  const handleGenerateImage = () => {
    if (currentMessage.trim() && onGenerateImage) {
      onGenerateImage(currentMessage.trim());
      setShowImageOptions(false);
    }
  };

  return (
    <div className="space-y-4 mx-auto max-w-3xl items-center">
      <div className="rounded-xl p-3 border border-white/10 bg-background shadow-2xl">
        {/* Uploaded Image Display */}
        {uploadedImage && (
          <div className="mb-3 p-2 border rounded-md bg-muted/20">
            <div className="flex items-center gap-2">
              <img
                src={URL.createObjectURL(uploadedImage)}
                alt="Uploaded"
                className="w-8 h-8 object-cover rounded"
              />
              <span className="text-sm text-muted-foreground truncate flex-1">
                {uploadedImage.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemoveImage}
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
            className="w-full min-h-12 max-h-32 p-2 text-lg border bg-transparent rounded-md resize-none focus:outline-none focus:ring-none focus:ring-none border-none overflow-y-auto"
            placeholder="Ask Juju"
            value={currentMessage}
            onChange={(e) => {
              setCurrentMessage(e.target.value);
              // Auto-resize textarea with max height
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
            }}
            onKeyDown={onKeyPress}
            disabled={isTyping}
          />
        </div>

        {/* Controls */}
        <div className="flex items-end gap-2">
          <div className="flex gap-2 flex-1">
            {/* Image Options */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={() => setShowImageOptions(!showImageOptions)}
                type="button"
              >
                <Plus className="h-3 w-3" />

              </Button>

              {showImageOptions && (
                <div className="absolute bottom-full mb-1 left-0 bg-card border rounded-md shadow-lg p-2 min-w-[120px] z-10">
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start h-8 text-xs"
                      onClick={handleGenerateImage}
                      disabled={!currentMessage.trim()}
                    >
                      <ArrowUp className="h-3 w-3 mr-2" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start h-8 text-xs"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-3 w-3 mr-2" />
                      Upload
                    </Button>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          <Button 
            className="h-8 px-4 bg-background text-foreground"
            onClick={onSendMessage}
            disabled={!currentMessage.trim() || isTyping}
          >
            {isTyping ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {isTyping ? 'Sending' : ''}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}