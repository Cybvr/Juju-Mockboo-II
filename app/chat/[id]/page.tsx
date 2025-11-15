"use client"
import { useState, useEffect, useRef } from "react"
import type React from "react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useParams, useRouter } from "next/navigation"
import { Loader2, ArrowLeft, Menu, X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { chatService } from "@/services/chatService"
import { useToast } from "@/hooks/use-toast"
import { storageService } from "@/services/storageService"
import { documentService } from "@/services/documentService"
import ChatControls from "@/app/common/dashboard/ChatControls"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  images?: string[];
}

interface ChatSession {
  id: string
  title: string
  userId: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export default function ChatDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [chatSession, setChatSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatId = params.id as string

  useEffect(() => {
    if (user && chatId) {
      loadChatSession()
    }
  }, [user, chatId])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const initialMessage = urlParams.get("message")
    if (initialMessage && !loading && !sending && chatSession && messages.length === 0) {
      setInputMessage(initialMessage)
      window.history.replaceState({}, '', window.location.pathname)
      // Auto-send the message immediately
      handleAutoSendMessage(initialMessage.trim())
    }
  }, [chatSession, messages, loading, sending])

  // Check for stored chat image on mount
  useEffect(() => {
    const storedChatImage = sessionStorage.getItem('chatImage');
    if (storedChatImage) {
      fetch(storedChatImage)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'chat-image.jpg', { type: 'image/jpeg' });
          setUploadedImage(file);
        })
        .catch(console.error);

      // Clear from session storage after using
      sessionStorage.removeItem('chatImage');
    }
  }, []);

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (chatSession && !isEditing) {
      setEditTitle(chatSession.title)
    }
  }, [chatSession, isEditing])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadChatSession = async () => {
    try {
      if (!user) return
      const session = await chatService.getChatSession(chatId, user.uid)
      if (!session) {
        router.push("/chat")
        return
      }
      setChatSession(session)
      setMessages(session.messages || [])
    } catch (error) {
      console.error("Failed to load chat session:", error)
      router.push("/chat")
    } finally {
      setLoading(false)
    }
  }

  const handleAutoSendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || sending || !user) return
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      content: messageContent,
      role: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setSending(true)
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageContent,
          chatId: chatId,
          messages: [...messages, userMessage],
        }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Chat API Error:', errorData)
        throw new Error(errorData.error || `Failed to send message: ${response.status}`)
      }
      const data = await response.json()
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: data.response?.toString().trim() || 'No response received',
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      await chatService.addMessage(chatId, userMessage)
      await chatService.addMessage(chatId, assistantMessage)
      if (messages.length === 0) {
        const newTitle = messageContent.substring(0, 50) + (messageContent.length > 50 ? "..." : "")
        await chatService.updateChatSession(chatId, { title: newTitle })
        setChatSession((prev) => (prev ? { ...prev, title: newTitle } : null))
      }
    } catch (error) {
      console.error("Failed to send message:", error)
      setMessages((prev) => prev.slice(0, -1))
      setInputMessage(messageContent)
    } finally {
      setSending(false)
    }
  }

  const handleSendMessage = async (isImageGeneration: boolean = false) => {
    if (!inputMessage.trim() && !uploadedImage) return;
    const messageContent = uploadedImage
      ? `${inputMessage.trim()}\n[Image: ${uploadedImage.name}]`
      : inputMessage.trim();

    // Check if user is requesting image generation
    const isImageRequest = isImageGeneration || isImageGenerationRequest(messageContent);

    if (isImageRequest) {
      // Add user message to chat BEFORE generating image
      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        content: messageContent,
        role: "user",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMessage])
      setInputMessage("")
      setUploadedImage(null)
      
      // Save user message to Firebase
      if (chatId && user) {
        await chatService.addMessage(chatId, userMessage)
      }
      
      // Handle image generation
      handleGenerateImage(messageContent);
      return;
    }

    const newMessage: Message = {
      id: `temp-${Date.now()}`,
      content: messageContent,
      role: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
    setInputMessage("")
    setUploadedImage(null)
    setSending(true)
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, newMessage],
          uploadedImage: uploadedImage ? {
            name: uploadedImage.name,
            size: uploadedImage.size,
            type: uploadedImage.type
          } : null,
          userId: user?.uid
        }),
      });
      const data = await response.json();
      if (data.success || data.content) {
        const responseContent = data.content || data.response || 'No response received';
        const aiMessage: Message = {
          id: `assistant-${Date.now()}`,
          content: responseContent.toString().trim() || 'No response received',
          role: 'assistant',
          timestamp: new Date(),
          images: data.images || undefined
        };
        setMessages((prev) => [...prev, aiMessage]);
        if (chatId && user) {
          try {
            await chatService.addMessage(chatId, newMessage);
            await chatService.addMessage(chatId, aiMessage);
          } catch (error) {
            console.error('Error saving messages to Firebase:', error);
            if (error.message && error.message.includes('too large')) {
              toast({
                title: "Message too large",
                description: "Your message content was too large to save. Please try with smaller content.",
                variant: "destructive",
              });
            }
          }
        }
      } else {
        console.error('Chat error:', data.error);
      }
    } catch (error) {
      console.error("Failed to send message:", error)
      setMessages((prev) => prev.slice(0, -1))
      setInputMessage(messageContent)
    } finally {
      setSending(false)
    }
  }

  // Helper function to detect image generation requests
  const isImageGenerationRequest = (content: string): boolean => {
    const imageKeywords = [
      'generate', 'create', 'make', 'draw', 'design', 'produce', 'show', 'need',
      'image', 'picture', 'photo', 'illustration', 'artwork', 'visual'
    ];

    const contentLower = content.toLowerCase();

    const patterns = [
      /generate.*image/i,
      /create.*image/i,
      /make.*image/i,
      /draw.*image/i,
      /image.*of/i,
      /picture.*of/i,
      /show.*me.*image/i,
      /need.*image/i,
      /i need.*image/i,
      /want.*image/i,
      /can.*you.*create/i,
      /can.*you.*generate/i,
      /can.*you.*make/i,
      /can.*you.*draw/i,
      /can.*you.*show/i
    ];

    return patterns.some(pattern => pattern.test(content)) ||
           (imageKeywords.some(keyword => contentLower.includes(keyword)) && 
            imageKeywords.filter(keyword => contentLower.includes(keyword)).length >= 2);
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(false)
    }
  }

  const handleDeleteChat = async () => {
    if (!chatSession || !user) return
    try {
      await chatService.deleteChatSession(chatSession.id)
      router.push("/chat")
    } catch (error) {
      console.error("Failed to delete chat:", error)
      toast({
        title: "Error",
        description: "Failed to delete chat.",
        variant: "destructive",
      })
    }
  }

  const handleNewChat = async () => {
    if (!user) return
    try {
      const newChat = await chatService.createChatSession(user.uid, 'New Chat')
      router.push(`/chat/${newChat.id}`)
    } catch (error) {
      console.error('Failed to create new chat:', error)
      toast({
        title: "Error",
        description: "Failed to create new chat.",
        variant: "destructive",
      })
    }
  }

  const handleTitleUpdate = (newTitle: string) => {
    if (chatSession) {
      setChatSession({ ...chatSession, title: newTitle })
    }
  }

  const handleImageUpload = (file: File) => {
    setUploadedImage(file)
  }

  const handleRemoveImage = () => {
    setUploadedImage(null)
  }

  const handleGenerateImage = async (prompt: string) => {
    if (!user) return
    setIsGeneratingImage(true)
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.uid,
        },
        body: JSON.stringify({
          mode: "text",
          prompt: prompt,
          settings: {
            model: "imagen-3.0-generate-002",
            aspectRatio: "1:1",
            outputs: "1",
          },
        }),
      })
      if (!response.ok) {
        throw new Error("Image generation failed")
      }
      const result = await response.json()
      if (result.images && result.images.length > 0) {
        const uploadedImageUrls = await storageService.uploadImages(result.images, user.uid)
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          content: `I've generated an image for you based on your prompt: "${prompt}"`,
          role: "assistant",
          timestamp: new Date(),
          images: uploadedImageUrls,
        }
        setMessages((prev) => [...prev, assistantMessage])
        await chatService.addMessage(chatId, assistantMessage)

        // Save generated images to user's library
        for (const imageUrl of uploadedImageUrls) {
          await documentService.saveChatImage(user.uid, imageUrl, prompt, chatId);
        }
      }
    } catch (error) {
      console.error("Failed to generate image:", error)
      toast({
        title: "Error",
        description: "Failed to generate image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="flex flex-1 relative min-h-0">
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <div className="border-b p-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <Button variant="ghost" size="sm" className="flex-shrink-0" onClick={() => router.push("/chat")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              {chatSession && (
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-semibold truncate">
                    {chatSession.title}
                  </h1>
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 sm:p-4 min-h-0">
            <div className="space-y-4 mx-auto max-w-4xl">
              {messages.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Start a conversation</h3>
                  <p className="text-muted-foreground text-md ">
                    Ask me anything about image generation, design, or creative ideas!
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] sm:max-w-[80%] rounded-lg shadow-sm ${
                      message.role === "user" ? "bg-card text-primary-foreground" : ""
                    } min-w-0`}>
                      <div className="p-2 sm:p-3">
                        {message.role === "user" ? (
                          <p className="text-md whitespace-pre-wrap break-words">{message.content}</p>
                        ) : (
                          <div className="text-md prose prose-base sm:prose-lg max-w-none dark:prose-invert">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                p: ({ children }) => <p className="mb-3 last:mb-0 text-md">{children}</p>,
                                h1: ({ children }) => <h1 className="text-xl sm:text-2xl font-semibold mb-3">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-lg sm:text-xl font-semibold mb-3">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-md font-semibold mb-2">{children}</h3>,
                                ul: ({ children }) => <ul className="list-disc pl-4 mb-3 text-md ">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal pl-4 mb-3 text-md ">{children}</ol>,
                                li: ({ children }) => <li className="mb-1 text-md ">{children}</li>,
                                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                em: ({ children }) => <em className="italic">{children}</em>,
                                img: ({ src, alt }) => (
                                  <img
                                    src={src}
                                    alt={alt}
                                    className="max-w-full h-auto rounded-lg my-2 cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => window.open(src, '_blank')}
                                  />
                                ),
                                code: ({ children, className }) => {
                                  const isBlock = className?.includes('language-');
                                  if (isBlock) {
                                    return <code className="block bg-muted p-2 rounded text-sm sm:text-md overflow-x-auto">{children}</code>;
                                  }
                                  return <code className="bg-muted px-1 rounded text-sm sm:text-md">{children}</code>;
                                },
                                pre: ({ children }) => <pre className="bg-muted p-2 rounded overflow-x-auto mb-3">{children}</pre>,
                                blockquote: ({ children }) => <blockquote className="border-l-4 border-muted-foreground/20 pl-4 italic mb-3 text-md ">{children}</blockquote>,
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                            {message.images && message.images.length > 0 && (
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                {message.images.map((imageUrl, imageIndex) => (
                                  <img
                                    key={imageIndex}
                                    src={imageUrl}
                                    alt={`Generated image ${imageIndex + 1}`}
                                    className="w-full h-auto border rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => window.open(imageUrl, '_blank')}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        <p className={`text-sm mt-2 sm:mt-3 ${message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {(sending || isGeneratingImage) && (
                <div className="flex justify-start">
                  <div className="rounded-lg shadow-sm bg-card p-2 sm:p-3">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                      <span className="text-md text-muted-foreground">
                        {isGeneratingImage ? 'Generating image...' : 'Thinking...'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
          <div className="border-t p-2 sm:p-4 flex-shrink-0">
            <ChatControls
              currentMessage={inputMessage}
              setCurrentMessage={setInputMessage}
              onSendMessage={() => handleSendMessage(false)}
              onKeyPress={handleKeyPress}
              isTyping={sending || isGeneratingImage}
              onImageUpload={handleImageUpload}
              onGenerateImage={(prompt) => {
                setInputMessage(prompt);
                setTimeout(() => handleSendMessage(true), 100);
              }}
              uploadedImage={uploadedImage}
              onRemoveImage={handleRemoveImage}
            />
          </div>
        </div>
      </div>
    </div>
  )
}