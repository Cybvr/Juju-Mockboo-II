'use client';
import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/app/common/dashboard/Header';
import MasterControl from '@/app/common/dashboard/MasterControl';
import { DocumentGallery } from '@/app/common/dashboard/DocumentGallery';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { chatService } from '@/services/chatService';
import { documentService } from '@/services/documentService';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  images?: string[];
}

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleVideoGenerate = async (params: {
    prompt: string;
    first_frame_image?: string;
    duration: number;
    prompt_optimizer: boolean;
  }) => {
    if (!user) return;
    setIsTyping(true);
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
        return { documentId: result.documentId };
      }
    } catch (error) {
      console.error('Video generation failed:', error);
      toast({
        title: "Error",
        description: "Failed to generate video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleImageGenerate = async (params: {
    mode: "text";
    prompt: string;
    settings: {
      resolution: string;
      outputs: string;
    };
  }) => {
    if (!user) return;
    setIsTyping(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.uid,
        },
        body: JSON.stringify(params),
      });
      if (!response.ok) {
        throw new Error('Failed to generate image');
      }
      const result = await response.json();

      // If we have generated images, upload to storage first, then create document
      if (result?.images && result.images.length > 0) {
        // Upload images to Firebase Storage if they're base64
        const { storageService } = await import('@/services/storageService');
        const uploadedImageUrls: string[] = [];
        for (const imageUrl of result.images) {
          if (imageUrl.startsWith('data:')) {
            // Convert base64 to storage URL
            const uploadedUrl = await storageService.uploadImage(user.uid, imageUrl);
            uploadedImageUrls.push(uploadedUrl);
          } else {
            // Already a URL
            uploadedImageUrls.push(imageUrl);
          }
        }
        const documentData = {
          title: params.prompt.substring(0, 50) + (params.prompt.length > 50 ? "..." : ""),
          description: `Generated with prompt: ${params.prompt}`,
          type: 'image' as const,
          content: {
            imageUrls: uploadedImageUrls,
            originalPrompt: params.prompt,
            settings: params.settings
          },
          tags: ['generated', 'ai-image'],
          isPublic: false,
          thumbnail: uploadedImageUrls[0]
        };
        const documentId = await documentService.createDocument(user.uid, documentData);
        router.push(`/m/${documentId}`);
        return { documentId };
      }
    } catch (error) {
      console.error('Image generation failed:', error);
      toast({
        title: "Error",
        description: "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !user) return;
    setIsTyping(true);
    try {
      // Create new chat session
      const newChat = await chatService.createChatSession(user.uid, currentMessage.substring(0, 50));
      // Create the user message
      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        content: currentMessage.trim(),
        role: "user",
        timestamp: new Date(),
      };
      // Send message to chat API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [userMessage],
          userId: user.uid
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to send message: ${response.status}`);
      }
      const data = await response.json();
      // Create assistant message
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: data.content || data.response || 'No response received',
        role: "assistant",
        timestamp: new Date(),
        images: data.images || undefined
      };
      // Save both messages to the chat session
      await chatService.addMessage(newChat.id, userMessage);
      await chatService.addMessage(newChat.id, assistantMessage);
      // Update chat title if it's still the default
      if (newChat.title === 'New Chat' || newChat.title === currentMessage.substring(0, 50)) {
        const newTitle = currentMessage.substring(0, 50) + (currentMessage.length > 50 ? "..." : "");
        await chatService.updateChatSession(newChat.id, { title: newTitle });
      }
      // Navigate to the chat
      router.push(`/dashboard/chat/${newChat.id}`);
    } catch (error) {
      console.error('Error creating chat:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

return (
  <div className="h-screen flex flex-col relative">
    <div className="lg:hidden">
      <DashboardHeader />
    </div>

    {/* Sticky Master Control - Hidden on mobile, shown on desktop */}
    <div className="hidden lg:block sticky top-0 z-20 ">
      <div className="container mx-auto max-w-3xl px-4 py-4">
        <MasterControl
          defaultMode="chat"
        />
      </div>
    </div>

    {/* Scrollable content area with padding bottom for mobile controls */}
    <div className="flex-1 overflow-auto pb-32 lg:pb-0">
      <div className="container mx-auto max-w-5xl px-4 py-6">
        {/* Documents Section */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Recent</h2>
          </div>
          <DocumentGallery />
        </div>
      </div>
    </div>

    {/* Mobile Master Control - Fixed at bottom on mobile, hidden on desktop */}
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur-md shadow-lg lg:hidden z-10">
      <div className="container mx-auto max-w-3xl px-4 py-2">
        <MasterControl
          defaultMode="chat"
        />
      </div>
    </div>
  </div>
);
}