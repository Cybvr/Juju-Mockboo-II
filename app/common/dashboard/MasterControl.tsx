'use client';
import React, { useState, useEffect } from 'react';
import { MessageCircle, Image, Video, ArrowUp, Plus, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { chatService } from '@/services/chatService';
import { documentService } from '@/services/documentService';
import { useToast } from '@/hooks/use-toast';
import ToolsPopover from './ToolsPopover';

type ControlMode = 'chat' | 'image' | 'video';

interface MasterControlProps {
  // Chat props
  currentMessage?: string;
  setCurrentMessage?: (message: string) => void;
  onSendMessage?: () => void;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  isTyping?: boolean;
  onImageUpload?: (file: File) => void;
  onGenerateImage?: (prompt: string) => void;
  uploadedImage?: File | null;
  onRemoveImage?: () => void;

  // Video props
  onVideoGenerate?: (params: {
    prompt: string;
    first_frame_image?: string;
    duration: number;
    prompt_optimizer: boolean;
  }) => Promise<{ documentId?: string } | void>;
  isVideoGenerating?: boolean;

  // Image props
  onImageGenerate?: (params: {
    mode: "text";
    prompt: string;
    settings: {
      resolution: string;
      outputs: string;
    };
  }) => Promise<{ documentId?: string } | void>;
  isImageGenerating?: boolean;
  initialPrompt?: string;

  // Control mode
  defaultMode?: ControlMode;
  className?: string;
}

export default function MasterControl({
  // Chat props
  currentMessage = '',
  setCurrentMessage = () => {},
  onSendMessage = () => {},
  onKeyPress = () => {},
  isTyping = false,
  onImageUpload,
  onGenerateImage,
  uploadedImage,
  onRemoveImage,

  // Video props
  onVideoGenerate = async () => {},
  isVideoGenerating = false,

  // Image props
  onImageGenerate,
  isImageGenerating = false,
  initialPrompt = '',

  // Control mode
  defaultMode = 'chat',
  className = ''
}: MasterControlProps) {
  const [mode, setMode] = useState<ControlMode>(defaultMode);
  const [isExpanded, setIsExpanded] = useState(false);

  // Unified state for all modes
  const [prompt, setPrompt] = useState(currentMessage || initialPrompt);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [internalImageGenerating, setInternalImageGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Image-specific state
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [outputs, setOutputs] = useState("1");

  // Video-specific state
  const [duration, setDuration] = useState(6);
  const [promptOptimizer, setPromptOptimizer] = useState(true);
  const [firstFrameImage, setFirstFrameImage] = useState('');
  const [videoUploadedImage, setVideoUploadedImage] = useState<File | null>(null);

  // Update prompt when external currentMessage changes
  React.useEffect(() => {
    setPrompt(currentMessage || initialPrompt);
  }, [currentMessage, initialPrompt]);

  // Handle click outside to collapse
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      // Don't collapse if clicking inside the container
      if (containerRef.current && containerRef.current.contains(target)) {
        return;
      }

      // Don't collapse if clicking on Select dropdowns or other portaled content
      const selectContent = document.querySelector('[data-radix-popper-content-wrapper]');
      if (selectContent && selectContent.contains(target)) {
        return;
      }

      // Don't collapse if clicking on any dropdown/popover content
      const isInDropdown = (target as Element).closest('[role="listbox"], [role="menu"], [data-radix-select-content], [data-radix-popover-content]');
      if (isInDropdown) {
        return;
      }

      // If we get here, it's truly outside - collapse
      setIsExpanded(false);
      setShowImageOptions(false);
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  // Unified handlers
  const handlePromptChange = (value: string) => {
    setPrompt(value);
    if (mode === 'chat') {
      setCurrentMessage(value);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (mode === 'chat' && onImageUpload) {
        onImageUpload(file);
      } else if (mode === 'video') {
        setVideoUploadedImage(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setFirstFrameImage(result);
        };
        reader.readAsDataURL(file);
      }
      setShowImageOptions(false);
    }
  };

  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    if (mode === 'chat') {
      if (onSendMessage) {
        onSendMessage();
      } else {
        // Handle chat creation and navigation internally
        await handleChatGenerate();
      }
    } else if (mode === 'image') {
      if (onImageGenerate) {
        const result = await onImageGenerate({
          mode: "text",
          prompt: prompt,
          settings: {
            resolution: aspectRatio,
            outputs,
          },
        });
        if (result?.documentId) {
          router.push(`/m/${result.documentId}`);
        }
      } else {
        // Handle image generation internally
        await handleImageGenerate();
      }
    } else if (mode === 'video') {
      const params: any = {
        prompt: prompt.trim(),
        duration,
        prompt_optimizer: promptOptimizer,
      };
      if (firstFrameImage) {
        params.first_frame_image = firstFrameImage;
      }
      if (onVideoGenerate) {
        const result = await onVideoGenerate(params);
        if (result?.documentId) {
          router.push(`/m/${result.documentId}`);
        }
      } else {
        // Handle video generation internally
        await handleVideoGenerate(params);
      }
    }
  };

  const handleChatGenerate = async () => {
    if (!user) return;
    try {
      // Create new chat session
      const newChat = await chatService.createChatSession(user.uid, prompt.substring(0, 50));
      // Navigate to chat with initial message
      router.push(`/dashboard/chat/${newChat.id}?message=${encodeURIComponent(prompt)}`);
      setPrompt('');
    } catch (error) {
      console.error('Error creating chat:', error);
      toast({
        title: "Error",
        description: "Failed to create chat. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImageGenerate = async () => {
    if (!user) return;
    setInternalImageGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.uid,
        },
        body: JSON.stringify({
          mode: "text",
          prompt: prompt,
          settings: {
            resolution: aspectRatio,
            outputs,
          },
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate image');
      }
      
      const result = await response.json();

      if (result?.images && result.images.length > 0) {
        // Upload images to Firebase Storage if they're base64
        const { storageService } = await import('@/services/storageService');
        const uploadedImageUrls: string[] = [];
        for (const imageUrl of result.images) {
          if (imageUrl.startsWith('data:')) {
            const uploadedUrl = await storageService.uploadImage(user.uid, imageUrl);
            uploadedImageUrls.push(uploadedUrl);
          } else {
            uploadedImageUrls.push(imageUrl);
          }
        }
        
        const documentData = {
          title: prompt.substring(0, 50) + (prompt.length > 50 ? "..." : ""),
          description: `Generated with prompt: ${prompt}`,
          type: 'image' as const,
          content: {
            imageUrls: uploadedImageUrls,
            originalPrompt: prompt,
            settings: { resolution: aspectRatio, outputs }
          },
          tags: ['generated', 'ai-image'],
          isPublic: false,
          thumbnail: uploadedImageUrls[0]
        };
        
        const documentId = await documentService.createDocument(user.uid, documentData);
        router.push(`/m/${documentId}`);
        setPrompt('');
      }
    } catch (error) {
      console.error('Image generation failed:', error);
      toast({
        title: "Error",
        description: "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setInternalImageGenerating(false);
    }
  };

  const handleVideoGenerate = async (params: any) => {
    if (!user) return;
    try {
      const response = await fetch('/api/videos/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate video');
      }
      
      const result = await response.json();

      if (result?.documentId) {
        router.push(`/m/${result.documentId}`);
        setPrompt('');
      }
    } catch (error) {
      console.error('Video generation failed:', error);
      toast({
        title: "Error",
        description: "Failed to generate video. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
    if (mode === 'chat') {
      onKeyPress(e);
    }
  };

  const handleInputClick = () => {
    setIsExpanded(true);
  };

  const isGenerating = isTyping || isImageGenerating || isVideoGenerating || internalImageGenerating;
  const displayUploadedImage = mode === 'chat' ? uploadedImage : videoUploadedImage;

  const getModeIcon = (mode: ControlMode) => {
    switch (mode) {
      case 'chat':
        return <MessageCircle className="w-4 h-4" />;
      case 'image':
        return <Image className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
    }
  };

  const getModeLabel = (mode: ControlMode) => {
    switch (mode) {
      case 'chat':
        return 'Chat';
      case 'image':
        return 'Image';
      case 'video':
        return 'Video';
    }
  };

  return (
    <div className={`flex-1 lg:flex-shrink-0 ${className}`}>
      <div className="space-y-4 mx-auto container max-w-4xl items-center">
        <div className={`rounded-xl p-3 border border-white/10 bg-background shadow-2xl transition-all duration-300 ${
          isExpanded ? '' : 'py-2'
        }`} ref={containerRef}>

          {/* Uploaded Image Display - only show when expanded */}
          {isExpanded && displayUploadedImage && (
            <div className="mb-3 p-2 border rounded-md bg-muted/20">
              <div className="flex items-center gap-2">
                <img
                  src={mode === 'chat' ? URL.createObjectURL(displayUploadedImage) : firstFrameImage}
                  alt="Uploaded"
                  className="w-8 h-8 object-cover rounded"
                />
                <span className="text-sm text-muted-foreground truncate flex-1">
                  {displayUploadedImage.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (mode === 'chat' && onRemoveImage) {
                      onRemoveImage();
                    } else if (mode === 'video') {
                      setVideoUploadedImage(null);
                      setFirstFrameImage('');
                    }
                  }}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className={`border-none ${isExpanded ? 'mb-3' : 'mb-0'}`}>
            {isExpanded ? (
              <textarea
                className="w-full min-h-12 max-h-32 p-2 text-lg bg-background rounded-md resize-none focus:outline-none overflow-y-auto border-none"
                placeholder={
                  mode === 'chat' ? "Ask Juju" :
                  mode === 'image' ? "Create image..." :
                  "Create video..."
                }
                value={prompt}
                onChange={(e) => {
                  handlePromptChange(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                }}
                onKeyDown={handleKeyPress}
                disabled={isGenerating}
                autoFocus
              />
            ) : (
              <input
                className="w-full h-10 px-3 text-lg bg-background rounded-md focus:outline-none border-none"
                placeholder={
                  mode === 'chat' ? "Ask Juju" :
                  mode === 'image' ? "Create image..." :
                  "Create video..."
                }
                value={prompt}
                onChange={(e) => handlePromptChange(e.target.value)}
                onClick={handleInputClick}
                onFocus={handleInputClick}
                onKeyDown={handleKeyPress}
                disabled={isGenerating}
              />
            )}
          </div>

          {/* Settings and Generate Button - only show when expanded */}
          {isExpanded && (
            <div className="flex items-end gap-3">
              <div className="flex gap-2 flex-1">

                {/* Mode Select */}
                <Select value={mode} onValueChange={(value) => setMode(value as ControlMode)}>
                  <SelectTrigger className="h-8 w-auto min-w-[90px] border-none">
                    <div className="flex items-center gap-2">
                      {getModeIcon(mode)}
                      <span className="hidden sm:inline text-xs">{getModeLabel(mode)}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chat">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        Chat
                      </div>
                    </SelectItem>
                    <SelectItem value="image">
                      <div className="flex items-center gap-2">
                        <Image className="w-4 h-4" />
                        Image
                      </div>
                    </SelectItem>
                    <SelectItem value="video">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        Video
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Tools Popover */}
                <ToolsPopover />

                {/* Upload Button */}
                {(mode === 'chat' || mode === 'video') && (
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs"
                      onClick={() => {
                        if (mode === 'chat') {
                          setShowImageOptions(!showImageOptions);
                        } else {
                          fileInputRef.current?.click();
                        }
                      }}
                      type="button"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>

                    {/* Chat image options dropdown */}
                    {mode === 'chat' && showImageOptions && (
                      <div className="absolute bottom-full mb-1 left-0 bg-card border rounded-md shadow-lg p-2 min-w-[120px] z-10">
                        <div className="space-y-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start h-8 text-xs"
                            onClick={() => {
                              if (prompt.trim() && onGenerateImage) {
                                onGenerateImage(prompt.trim());
                                setShowImageOptions(false);
                              }
                            }}
                            disabled={!prompt.trim()}
                          >
                            <ArrowUp className="h-3 w-3 mr-2" />
                            Generate
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
                      className={mode === 'video' ? "absolute inset-0 w-full h-full opacity-0 cursor-pointer" : "hidden"}
                    />
                  </div>
                )}

                {/* Mode-specific controls */}
                {mode === 'image' && (
                  <>
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
                  </>
                )}

                {mode === 'video' && (
                  <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
                    <SelectTrigger className="h-8 text-xs w-auto min-w-[100px] border-none">
                      <SelectValue placeholder="Duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 seconds</SelectItem>
                      <SelectItem value="10">10 seconds</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <Button
                size="sm"
                variant="outline"
                className="h-8 px-4 bg-background text-foreground"
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
              >
                <ArrowUp className="h-4 w-4" />
                {mode === 'chat' && (
                  <span className="hidden sm:inline ml-1">
                    {isTyping ? 'Sending' : ''}
                  </span>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}