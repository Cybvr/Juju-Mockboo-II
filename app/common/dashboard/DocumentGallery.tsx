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

  const flattenedDocuments: FlattenedDocument[] = documents.map(doc => {
    let mediaUrl = '/placeholder.svg'
    let mediaType: 'image' | 'video' = 'image'
    
    if (doc.type === 'canvas') {
      if (doc.content?.thumbnail) {
        mediaUrl = doc.content.thumbnail
      } else if (doc.content?.canvasData?.thumbnail) {
        mediaUrl = doc.content.canvasData.thumbnail
      }
    } else if (doc.type === 'video') {
      mediaType = 'video'
      if (doc.content?.videoUrls && doc.content.videoUrls.length > 0) {
        mediaUrl = doc.content.videoUrls[0]
      } else if (doc.content?.thumbnail) {
        mediaUrl = doc.content.thumbnail
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
      mediaType: mediaType,
      updatedAt: doc.updatedAt,
      likedBy: doc.likedBy,
      likesCount: doc.likesCount,
      originalDoc: doc
    }
  })

  // Filter to show canvas, video, and scenes documents
  const displayDocuments = flattenedDocuments.filter(item => item.type === "canvas" || item.type === "video" || item.type === "scenes");

  const handleDeleteClick = (documentId: string) => {
    const flatDoc = flattenedDocuments.find(item => item.id === documentId)
    if (flatDoc) {
      setDeleteDocumentId(flatDoc.originalDocId)
      setShowDeleteDialog(true)
    }
  }

  const handleDelete = async () => {
    console.log('GALLERY DELETE: handleDelete started', { deleteDocumentId })
    
    try {
      console.log('GALLERY DELETE: About to call documentService.deleteDocument')
      await documentService.deleteDocument(deleteDocumentId)
      console.log('GALLERY DELETE: Successfully deleted document from Firebase')
      
      // Immediately update state to remove the deleted document
      setDocuments((prev) => {
        const newDocs = prev.filter((doc) => doc.id !== deleteDocumentId)
        console.log('GALLERY DELETE: Updated documents state', { 
          oldCount: prev.length, 
          newCount: newDocs.length,
          deletedId: deleteDocumentId 
        })
        return newDocs
      })
      
      toast.success("Document deleted successfully")
      console.log('GALLERY DELETE: Success toast shown')
    } catch (error) {
      console.error("GALLERY DELETE: Error deleting document:", error)
      toast.error("Failed to delete document")
    } finally {
      console.log('GALLERY DELETE: In finally block - closing dialog')
      // Always close dialog and reset state
      setShowDeleteDialog(false)
      setDeleteDocumentId("")
      console.log('GALLERY DELETE: Dialog closed and state reset')
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
    } else if (document?.type === "video" || document?.type === "scenes") {
      router.push(`/dashboard/videos/${flatDoc.originalDocId}`)
    } else {
      router.push(`/m/${flatDoc.originalDocId}`)
    }
  }

  const isDocumentLiked = (flatDoc: FlattenedDocument) => {
    return flatDoc.likedBy && flatDoc.likedBy.includes(user?.uid)
  }

  return (
    <>
      <div>
        <div>
          <div className="flex items-center justify-between mb-2">

            <div className="">
              <h2 className="text-lg font-semibold">Recent</h2>
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
            <div className="w-8 h-8  rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {displayDocuments.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {displayDocuments.map((flatDoc) => (
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
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop - clicking closes dialog */}
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setShowDeleteDialog(false)}
          />
          
          {/* Dialog Content */}
          <div className="relative bg-background border rounded-lg shadow-lg max-w-md w-full p-6 space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Delete Document</h3>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete this document? This action cannot be undone.
              </p>
            </div>
            
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 sm:gap-0">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
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
