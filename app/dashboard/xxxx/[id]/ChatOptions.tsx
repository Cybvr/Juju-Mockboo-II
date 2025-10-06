import { useState } from "react"
import { MoreHorizontal, Share, Edit3, Star, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { chatService } from "@/services/chatService"

interface ChatOptionsProps {
  chatId: string
  title: string
  isStarred?: boolean
  onTitleUpdate: (newTitle: string) => void
  onDelete: () => void
  onStar?: (starred: boolean) => void
}

export default function ChatOptions({
  chatId,
  title,
  isStarred = false,
  onTitleUpdate,
  onDelete,
  onStar
}: ChatOptionsProps) {
  const { toast } = useToast()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [newTitle, setNewTitle] = useState(title)
  const [isLoading, setIsLoading] = useState(false)

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: title,
          url: window.location.href,
        })
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(window.location.href)
        toast({
          title: "Link copied",
          description: "Chat link has been copied to your clipboard.",
        })
      }
    } catch (error) {
      console.error('Error sharing:', error)
      toast({
        title: "Error",
        description: "Failed to share chat.",
        variant: "destructive",
      })
    }
  }

  const handleRename = async () => {
    if (!newTitle.trim() || newTitle.trim() === title) {
      setIsRenameDialogOpen(false)
      setNewTitle(title)
      return
    }

    setIsLoading(true)
    try {
      await chatService.updateChatSession(chatId, { title: newTitle.trim() })
      onTitleUpdate(newTitle.trim())
      setIsRenameDialogOpen(false)
      toast({
        title: "Chat renamed",
        description: "Chat title has been updated successfully.",
      })
    } catch (error) {
      console.error('Error renaming chat:', error)
      toast({
        title: "Error",
        description: "Failed to rename chat.",
        variant: "destructive",
      })
      setNewTitle(title)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStar = async () => {
    try {
      const newStarredState = !isStarred
      // Here you would typically update the chat's starred status in your database
      // For now, we'll just call the onStar callback if provided
      if (onStar) {
        onStar(newStarredState)
      }
      toast({
        title: newStarredState ? "Chat starred" : "Chat unstarred",
        description: newStarredState 
          ? "Chat has been added to your starred chats." 
          : "Chat has been removed from your starred chats.",
      })
    } catch (error) {
      console.error('Error starring chat:', error)
      toast({
        title: "Error",
        description: "Failed to update chat star status.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = () => {
    setIsDeleteDialogOpen(false)
    onDelete()
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open chat options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleShare} className="cursor-pointer">
            <Share className="mr-2 h-4 w-4" />
            Share
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => {
              setNewTitle(title)
              setIsRenameDialogOpen(true)
            }} 
            className="cursor-pointer"
          >
            <Edit3 className="mr-2 h-4 w-4" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleStar} className="cursor-pointer">
            <Star className={`mr-2 h-4 w-4 ${isStarred ? 'fill-current' : ''}`} />
            {isStarred ? 'Unstar' : 'Star'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setIsDeleteDialogOpen(true)} 
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter new chat title"
              maxLength={100}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRename()
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRenameDialogOpen(false)
                setNewTitle(title)
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={isLoading || !newTitle.trim()}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this chat? This action cannot be undone and will permanently delete all messages in this conversation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}