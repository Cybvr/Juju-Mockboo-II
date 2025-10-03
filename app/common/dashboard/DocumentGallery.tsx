"use client"
import { useState, useEffect } from "react"
import { DocumentCard } from "@/components/DocumentCard"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { documentService } from "@/services/documentService"
import type { Document } from "@/types/firebase"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { AddToBoardModal } from '@/components/AddToBoardModal';

interface DocumentGalleryProps {
  emptyStateMessage?: string
}

type FilterType = "all" | "scene" | "canvas"

interface FlattenedDocument {
  id: string
  originalDocId: string
  title: string
  type: Document['type']
  mediaUrl: string
  mediaType: 'image' | 'video'
  updatedAt: Document['updatedAt']
  likedBy: Document['likedBy']
  likesCount: Document['likesCount']
  originalDoc: Document
}

export function DocumentGallery({
  emptyStateMessage = "No documents found. Start creating!"
}: DocumentGalleryProps) {
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [user] = useAuthState(auth)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const [deleteDocumentId, setDeleteDocumentId] = useState<string>("")
  const [renameDocumentId, setRenameDocumentId] = useState<string>("")
  const [newName, setNewName] = useState("")
  const [filterType, setFilterType] = useState<FilterType>("all")
  const [showAddToBoardDialog, setShowAddToBoardDialog] = useState(false)
  const [selectedDocumentUrl, setSelectedDocumentUrl] = useState<string | null>(null)
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null)

  useEffect(() => {
    const loadUserDocuments = async () => {
      if (!user) {
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const userDocs = await documentService.getUserRecentDocuments(user.uid, 100)
        setDocuments(userDocs)
      } catch (error) {
        console.error("Failed to load documents:", error)
        toast.error("Failed to load your documents")
      } finally {
        setLoading(false)
      }
    }
    loadUserDocuments()
  }, [user])

  const createNewCanvas = async () => {
    if (!user) return;
    try {
      const canvasDocument = await documentService.createDocument(user.uid, {
        title: 'New Canvas',
        content: {
          elements: [],
          version: '1.0'
        },
        tags: ['canvas'],
        type: 'canvas' as const,
        isPublic: false,
        starred: false,
        shared: false,
        category: 'UGC' as const,
      });
      router.push(`/dashboard/canvas/${canvasDocument}`);
    } catch (error) {
      console.error('Error creating new canvas:', error);
      toast.error("Failed to create new canvas");
    }
  };

  // Map documents directly
  const flattenedDocuments: FlattenedDocument[] = documents.map(doc => {
    let mediaUrl = '/placeholder.svg'
    
    // Handle different document types for thumbnails
    if (doc.type === 'canvas') {
      // For canvas, check content.thumbnail first, then content.canvasData thumbnail
      if (doc.content?.thumbnail) {
        mediaUrl = doc.content.thumbnail
      } else if (doc.content?.canvasData?.thumbnail) {
        mediaUrl = doc.content.canvasData.thumbnail
      }
    } else if (doc.content?.thumbnail) {
      mediaUrl = doc.content.thumbnail
    } else if (doc.content?.imageUrls && doc.content.imageUrls.length > 0) {
      mediaUrl = doc.content.imageUrls[0]
    }

    return {
      id: doc.id,
      originalDocId: doc.id,
      title: doc.title,
      type: doc.type,
      mediaUrl: mediaUrl,
      mediaType: 'image',
      updatedAt: doc.updatedAt,
      likedBy: doc.likedBy,
      likesCount: doc.likesCount,
      originalDoc: doc
    }
  })

  const filteredFlattenedDocs = flattenedDocuments.filter(item => {
    if (filterType === "all") return item.type === "canvas" || item.type === "scenes"
    if (filterType === "scene") {
      return item.type === "scenes" || (item.type === "video" && item.originalDoc.content?.scenes)
    }
    if (filterType === "canvas") {
      return item.type === "canvas"
    }
    return false;
  });

  const handleDeleteClick = (documentId: string) => {
    // Extract the original document ID from the flattened ID
    const flatDoc = flattenedDocuments.find(item => item.id === documentId)
    if (flatDoc) {
      setDeleteDocumentId(flatDoc.originalDocId)
      setShowDeleteDialog(true)
    }
  }

  const handleDelete = async () => {
    try {
      await documentService.deleteDocument(deleteDocumentId)
      setDocuments((prev) => {
        const updatedDocs = prev.filter((doc) => doc.id !== deleteDocumentId)
        // Reset filter to "all" if current filter type has no documents left
        const filteredAfterDelete = updatedDocs.filter(doc => {
          if (filterType === "all") return true
          return doc.type === filterType
        })
        if (filteredAfterDelete.length === 0 && updatedDocs.length > 0) {
          setFilterType("all")
        }
        return updatedDocs
      })
      toast.success("Document deleted successfully")
    } catch (error) {
      console.error("Error deleting document:", error)
      toast.error("Failed to delete document")
    } finally {
      setShowDeleteDialog(false)
      setDeleteDocumentId("")
    }
  }

  const handleRenameClick = (documentId: string) => {
    const flatDoc = flattenedDocuments.find(item => item.id === documentId)
    if (flatDoc) {
      setRenameDocumentId(flatDoc.originalDocId)
      setNewName(flatDoc.title)
      setShowRenameDialog(true)
    }
  }

  const handleRename = async () => {
    if (!newName.trim()) return
    try {
      await documentService.renameDocument(renameDocumentId, newName.trim())
      setDocuments((prev) =>
        prev.map((doc) => (doc.id === renameDocumentId ? { ...doc, title: newName.trim() } : doc)),
      )
      toast.success("Document renamed successfully")
    } catch (error) {
      console.error("Error renaming document:", error)
      toast.error("Failed to rename document")
    } finally {
      setShowRenameDialog(false)
      setRenameDocumentId("")
      setNewName("")
    }
  }

  const handleDownload = async (documentId: string, thumbnail: string, name: string) => {
    try {
      const link = document.createElement("a")
      link.href = thumbnail
      link.download = `${name}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error downloading image:", error)
      window.open(thumbnail, "_blank")
    }
  }

  const handleLike = async (documentId: string, isLiked: boolean) => {
    if (!user) {
      toast.error("Please sign in to like documents")
      return
    }
    const flatDoc = flattenedDocuments.find(item => item.id === documentId)
    if (!flatDoc) return
    try {
      const newLikeState = await documentService.toggleLike(flatDoc.originalDocId, user.uid)
      setDocuments((prev) =>
        prev.map((doc) => {
          if (doc.id === flatDoc.originalDocId) {
            const currentLikes = doc.likedBy || []
            const updatedLikes = newLikeState
              ? [...currentLikes.filter((uid) => uid !== user.uid), user.uid]
              : currentLikes.filter((uid) => uid !== user.uid)
            return {
              ...doc,
              likedBy: updatedLikes,
              likesCount: updatedLikes.length,
            }
          }
          return doc
        }),
      )
      toast.success(newLikeState ? "Added to favorites" : "Removed from favorites")
    } catch (error) {
      console.error("Error toggling like:", error)
      toast.error("Failed to update favorite status")
    }
  }

  const handleDuplicate = async (documentId: string) => {
    if (!user) {
      toast.error("Please sign in to duplicate documents")
      return
    }
    
    const flatDoc = flattenedDocuments.find(item => item.id === documentId)
    if (!flatDoc) return
    
    try {
      const originalDoc = flatDoc.originalDoc
      const duplicatedDoc = await documentService.createDocument(user.uid, {
        ...originalDoc,
        title: `${originalDoc.title} (Copy)`,
        id: undefined,
        createdAt: undefined,
        updatedAt: undefined
      })
      
      // Refresh the documents list
      const userDocs = await documentService.getUserRecentDocuments(user.uid, 100)
      setDocuments(userDocs)
      
      toast.success("Document duplicated successfully")
    } catch (error) {
      console.error("Error duplicating document:", error)
      toast.error("Failed to duplicate document")
    }
  }

  const handleDocumentClick = async (documentId: string) => {
    const flatDoc = flattenedDocuments.find(item => item.id === documentId)
    if (!flatDoc) return
    const document = flatDoc.originalDoc
    if (document?.type === "canvas") {
      router.push(`/dashboard/canvas/${flatDoc.originalDocId}`)
    } else if (document?.type === "scenes" || (document?.type === "video" && document?.content?.scenes)) {
      router.push(`/dashboard/scenes/${flatDoc.originalDocId}`)
    } else {
      router.push(`/m/${flatDoc.originalDocId}`)
    }
  }

  // Helper function to check if a document is liked by the current user
  const isDocumentLiked = (flatDoc: FlattenedDocument) => {
    return flatDoc.likedBy && flatDoc.likedBy.includes(user?.uid)
  }

  return (
    <>
      <div>
        <div>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant={filterType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("all")}
              >
                All
              </Button>
              <Button
                variant={filterType === "scene" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("scene")}
              >
                Scenes
              </Button>
              <Button
                variant={filterType === "canvas" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("canvas")}
              >
                Canvas
              </Button>
            </div>
            <div className="flex items-center">
              <Button
                onClick={createNewCanvas}
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New
              </Button>
            </div>
            
          </div>
          
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredFlattenedDocs.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredFlattenedDocs.map((flatDoc) => (
                  <DocumentCard
                    key={flatDoc.id}
                    document={{
                      id: flatDoc.id,
                      name: flatDoc.title,
                      modified: (() => {
                        if (flatDoc.updatedAt instanceof Date) {
                          return flatDoc.updatedAt.toLocaleDateString()
                        }
                        if (
                          flatDoc.updatedAt &&
                          typeof flatDoc.updatedAt === "object" &&
                          "toDate" in flatDoc.updatedAt
                        ) {
                          return (flatDoc.updatedAt as any).toDate().toLocaleDateString()
                        }
                        return new Date().toLocaleDateString()
                      })(),
                      thumbnail: flatDoc.mediaUrl,
                      type: flatDoc.mediaType,
                    }}
                    onDelete={handleDeleteClick}
                    onRename={handleRenameClick}
                    onLike={handleLike}
                    onDownload={handleDownload}
                    onDuplicate={handleDuplicate}
                    isLiked={isDocumentLiked(flatDoc)}
                    onClick={() => handleDocumentClick(flatDoc.id)}
                    onAddToBoard={(docId: string, imageUrl: string) => {
                      setSelectedDocumentId(flatDoc.originalDocId);
                      setSelectedDocumentUrl(imageUrl);
                      setShowAddToBoardDialog(true);
                    }}
                    mediaType={flatDoc.mediaType}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{emptyStateMessage}</p>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Add to Board Modal */}
      <AddToBoardModal
        isOpen={showAddToBoardDialog}
        onClose={() => {
          setShowAddToBoardDialog(false);
          setSelectedDocumentId(null);
          setSelectedDocumentUrl(null);
        }}
        documentId={selectedDocumentId}
        imageUrl={selectedDocumentUrl}
      />
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
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
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Document</DialogTitle>
            <DialogDescription>Enter a new name for your document.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="col-span-3"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleRename()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenameDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRename}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
