// @/app/dashboard/chat/[id]/ChatHistory.tsx
"use client"
import { Check, X, Trash2, MoreHorizontal, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { chatService } from "@/services/chatService"
import { useState } from "react"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

interface ChatSession {
  id: string
  title: string
  userId: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

interface RecentChat {
  id: string
  title: string
  updatedAt: Date
}

interface ChatHistoryProps {
  chatSession: ChatSession | null
  setChatSession: (session: ChatSession | null) => void
  messages: Message[]
  isEditing: boolean
  setIsEditing: (editing: boolean) => void
  editTitle: string
  setEditTitle: (title: string) => void
  isDeleting: boolean
  onDelete: () => void
  onNewChat: () => void
  onChatSelect: (chatId: string) => void
  recentChats: RecentChat[]
}

export default function ChatHistory({
  chatSession,
  setChatSession,
  messages,
  isEditing,
  setIsEditing,
  editTitle,
  setEditTitle,
  isDeleting,
  onDelete,
  onNewChat,
  onChatSelect,
  recentChats,
}: ChatHistoryProps) {
  const { toast } = useToast()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleTitleSave = async () => {
    if (!chatSession) return
    try {
      await chatService.updateChatSession(chatSession.id, { title: editTitle })
      setIsEditing(false)
      setChatSession({ ...chatSession, title: editTitle })
      toast({
        title: "Title updated",
        description: "Chat title has been updated successfully.",
      })
    } catch (error) {
      console.error("Failed to update title:", error)
      toast({
        title: "Error",
        description: "Failed to update chat title.",
        variant: "destructive",
      })
    }
  }

  const handleTitleCancel = () => {
    if (chatSession) {
      setEditTitle(chatSession.title)
    }
    setIsEditing(false)
  }

  return (
    <div className="space-y-4">
      {/* Current Chat Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1" onClick={() => setIsEditing(true)} style={{ cursor: "pointer" }}>
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="text-lg font-semibold" />
              <Button size="sm" onClick={handleTitleSave}>
                <Check className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleTitleCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div>
                <h1 className="font-semibold">{chatSession?.title || "New Chat"}</h1>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Recent Chats */}
      {recentChats && recentChats.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Recent Chats</h3>
          <div className="space-y-1">
            {recentChats.map((chat) => (
              <div
                key={chat.id}
                className={`p-2 rounded-md cursor-pointer text-sm hover:bg-muted/50 transition-colors ${
                  chat.id === chatSession?.id ? 'bg-muted' : ''
                }`}
                onClick={() => onChatSelect(chat.id)}
              >
                <div className="font-medium truncate">{chat.title}</div>
                <div className="text-xs text-muted-foreground">
                  {chat.updatedAt.toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Chat</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this chat? This action cannot be undone. All messages and conversation
                history will be permanently lost.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  onDelete?.()
                  setShowDeleteDialog(false)
                }}
                className="bg-destructive text-destructive-foreground"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  )
}