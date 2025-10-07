"use client"

import { useState, useEffect } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { boardService } from '@/services/boardService'
import { toast } from "sonner"
import { Plus, Folder, Edit2, Trash2, MoreVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface Board {
  id: string;
  name: string;
  imageUrls: string[];
  userId: string;
  createdAt: any;
}

export function CollectionView() {
  const [user] = useAuthState(auth)
  const [boards, setBoards] = useState<Board[]>([])
  const [loadingBoards, setLoadingBoards] = useState(false)
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null)
  const [editingBoardName, setEditingBoardName] = useState("")
  const [newBoardName, setNewBoardName] = useState("")
  const [showCreateBoard, setShowCreateBoard] = useState(false)

  useEffect(() => {
    const loadUserBoards = async () => {
      if (!user) return

      try {
        setLoadingBoards(true)
        const userBoards = await boardService.getBoards(user.uid)
        setBoards(userBoards)
      } catch (error) {
        console.error("Failed to load boards:", error)
        toast.error("Failed to load your collections")
      } finally {
        setLoadingBoards(false)
      }
    }
    loadUserBoards()
  }, [user])

  const handleCreateBoard = async () => {
    if (!newBoardName.trim() || !user) return

    try {
      const newBoard = await boardService.createBoard(user.uid, newBoardName.trim())
      setBoards(prev => [...prev, newBoard])
      setNewBoardName('')
      setShowCreateBoard(false)
      toast.success("Collection created successfully!")
    } catch (error) {
      console.error("Error creating board:", error)
      toast.error("Failed to create collection")
    }
  }

  const handleUpdateBoard = async (boardId: string, newName: string) => {
    if (!newName.trim()) return

    try {
      await boardService.updateBoard(boardId, { name: newName.trim() })
      setBoards(prev => prev.map(board => 
        board.id === boardId ? { ...board, name: newName.trim() } : board
      ))
      setEditingBoardId(null)
      setEditingBoardName('')
      toast.success("Collection renamed successfully!")
    } catch (error) {
      console.error("Error updating board:", error)
      toast.error("Failed to rename collection")
    }
  }

  const handleDeleteBoard = async (boardId: string) => {
    try {
      await boardService.deleteBoard(boardId)
      setBoards(prev => prev.filter(board => board.id !== boardId))
      toast.success("Collection deleted successfully!")
    } catch (error) {
      console.error("Error deleting board:", error)
      toast.error("Failed to delete collection")
    }
  }

  const startEditingBoard = (board: Board) => {
    setEditingBoardId(board.id)
    setEditingBoardName(board.name)
  }

  const cancelEditingBoard = () => {
    setEditingBoardId(null)
    setEditingBoardName('')
  }

  if (loadingBoards) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {boards.length} collection{boards.length !== 1 ? "s" : ""}
        </div>
        <button
          onClick={() => setShowCreateBoard(true)}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-3 h-3" />
          Create Collection
        </button>
      </div>

      {boards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {boards.map((board) => (
            <div key={board.id} className="bg-card p-4 rounded-lg border group">
              <div className="flex items-start justify-between mb-3">
                {editingBoardId === board.id ? (
                  <div className="flex-1 flex gap-2">
                    <Input
                      value={editingBoardName}
                      onChange={(e) => setEditingBoardName(e.target.value)}
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleUpdateBoard(board.id, editingBoardName);
                        } else if (e.key === 'Escape') {
                          cancelEditingBoard();
                        }
                      }}
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={() => handleUpdateBoard(board.id, editingBoardName)}
                      disabled={!editingBoardName.trim()}
                    >
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEditingBoard}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <div>
                      <h3 className="font-medium text-sm">{board.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {(board.imageUrls || []).length} image{(board.imageUrls || []).length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => startEditingBoard(board)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteBoard(board.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>

              <div className="aspect-square bg-muted/20 rounded-lg flex items-center justify-center">
                {(board.imageUrls || []).length > 0 ? (
                  <div className="grid grid-cols-2 gap-1 w-full h-full p-2">
                    {(board.imageUrls || []).slice(0, 4).map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt=""
                        className="w-full h-full object-cover rounded"
                      />
                    ))}
                  </div>
                ) : (
                  <Folder className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No collections found</p>
          <Button
            variant="outline"
            onClick={() => setShowCreateBoard(true)}
            className="mt-4"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Collection
          </Button>
        </div>
      )}

      {/* Create Collection Dialog */}
      <Dialog open={showCreateBoard} onOpenChange={setShowCreateBoard}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Collection</DialogTitle>
            <DialogDescription>Enter a name for your new collection.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="collection-name" className="text-right">
                Name
              </Label>
              <Input
                id="collection-name"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                className="col-span-3"
                placeholder="My Collection"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateBoard()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateBoard(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateBoard} disabled={!newBoardName.trim()}>
              Create Collection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}