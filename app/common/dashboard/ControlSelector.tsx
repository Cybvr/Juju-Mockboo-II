'use client';
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MessageCircle, Image, Video } from 'lucide-react';
import ChatControls from './ChatControls';
import { VideoControls } from '@/app/common/dashboard/VideoControls';
import { DesignControls } from '@/app/common/dashboard/DesignControls';

type ControlMode = 'chat' | 'video' | 'image';

interface ControlSelectorProps {
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
}

export default function ControlSelector({
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
  onVideoGenerate = () => {},
  isVideoGenerating = false,

  // Image props
  onImageGenerate,
  isImageGenerating = false,
  initialPrompt = '',

  // Control mode
  defaultMode = 'chat'
}: ControlSelectorProps) {
  const [mode, setMode] = useState<ControlMode>(defaultMode);

  return (
    <div className="flex-1 lg:flex-shrink-0">
      <Tabs value={mode} onValueChange={(value) => setMode(value as ControlMode)} className="w-full">
        <div className="flex justify-center mb-1">
          <TabsList className="grid w-auto grid-cols-3 bg-muted">
            <TabsTrigger value="chat" className="px-6 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="image" className="px-6 flex items-center gap-2">
              <Image className="w-4 h-4" />
              Image
            </TabsTrigger>
            <TabsTrigger value="video" className="px-6 flex items-center gap-2">
              <Video className="w-4 h-4" />
              Video
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="chat" className="mt-0">
          <ChatControls
            currentMessage={currentMessage}
            setCurrentMessage={setCurrentMessage}
            onSendMessage={onSendMessage}
            onKeyPress={onKeyPress}
            isTyping={isTyping}
            onImageUpload={onImageUpload}
            onGenerateImage={onGenerateImage}
            uploadedImage={uploadedImage}
            onRemoveImage={onRemoveImage}
          />
        </TabsContent>

        <TabsContent value="image" className="mt-0">
          <DesignControls
            isGenerating={isImageGenerating}
            initialPrompt={initialPrompt}
            onGenerate={onImageGenerate}
          />
        </TabsContent>

        <TabsContent value="video" className="mt-0">
          <VideoControls
            onGenerate={onVideoGenerate}
            isGenerating={isVideoGenerating}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}