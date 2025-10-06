// @/app/dashboard/chat/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatControls from '@/app/common/dashboard/ChatControls';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { chatService } from '@/services/chatService';
import { DashboardHeader } from '@/app/common/dashboard/Header';
import { useToast } from '@/hooks/use-toast';

interface RecentChat {
  id: string;
  title: string;
  updatedAt: Date;
}

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  images?: string[];
}

export default function ChatLandingPage() {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);
  const { toast } = useToast();
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
      return;
    }
    if (user) {
      loadRecentChats();
    }
  }, [user, loading]);

  const loadRecentChats = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const sessions = await chatService.getUserChatSessions(user.uid);
      const chatsWithMessages = sessions.map(session => ({
        id: session.id,
        title: session.title,
        updatedAt: session.updatedAt
      }));
      setRecentChats(chatsWithMessages);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !user) return;

    setIsCreatingChat(true);
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
      console.error('Failed to create chat:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleChatSelect = (chatId: string) => {
    router.push(`/dashboard/chat/${chatId}`);
  };

  const handleNewChat = () => {
    setCurrentMessage('');
    // Stay on current page for new chat
  };

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col relative">
      <DashboardHeader />

      {/* Scrollable content area with padding bottom for mobile controls */}
      <div className="flex-1 overflow-auto pb-32 lg:pb-0">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">
          <div className="flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[60vh] space-y-6 sm:space-y-8">
            <div className="text-center space-y-3 sm:space-y-4 px-4 hidden lg:block">
              <h1 className="text-lg sm:text-xl font-normal">What would you like to know?</h1>
            </div>

            {/* Chat Controls - Hidden on mobile, shown on desktop */}
            <div className="w-full max-w-2xl px-2 sm:px-0 hidden lg:block">
              <ChatControls
                currentMessage={currentMessage}
                setCurrentMessage={setCurrentMessage}
                onSendMessage={handleSendMessage}
                onKeyPress={handleKeyPress}
                isTyping={isCreatingChat}
              />
            </div>

            {/* Recent Chats Section */}
            {recentChats.length > 0 && (
              <div className="w-full max-w-2xl px-2 sm:px-0 mt-2">
                <div className="space-y-3 sm:space-y-4">
                  <h2 className="text-lg sm:text-xl font-semibold">Recent</h2>
                  <div className="grid gap-2 sm:gap-3">
                    {recentChats.map((chat) => (
                      <div
                        key={chat.id}
                        className="p-3 sm:p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors touch-manipulation"
                        onClick={() => handleChatSelect(chat.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm sm:text-base pr-2">
                              {chat.title.length > 40 ? `${chat.title.substring(0, 40)}...` : chat.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                              {chat.updatedAt.toLocaleDateString()} at {chat.updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Chat Controls - Fixed at bottom on mobile, hidden on desktop */}
      <div className="fixed bottom-0 left-0 right-0 border-t shadow-lg lg:hidden z-10">
        <div className="container mx-auto max-w-2xl">
          <ChatControls
            currentMessage={currentMessage}
            setCurrentMessage={setCurrentMessage}
            onSendMessage={handleSendMessage}
            onKeyPress={handleKeyPress}
            isTyping={isCreatingChat}
          />
        </div>
      </div>
    </div>
  );
}