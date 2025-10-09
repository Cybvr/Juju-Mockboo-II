"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, FileText, Calendar, Trash2, Copy, MoreVertical } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { storiesService, StoryDocument } from "@/services/storiesService"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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

export default function StorymakerDocumentsPage() {
  const router = useRouter()
  const [user, loading] = useAuthState(auth)
  const [documents, setDocuments] = useState<StoryDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [storyToDelete, setStoryToDelete] = useState<string | null>(null)

  useEffect(() => {
    const loadStories = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      await new Promise(resolve => setTimeout(resolve, 100))

      try {
        const userStories = await storiesService.getUserStories(user.uid)
        setDocuments(userStories)
      } catch (error) {
        console.error('Error loading stories:', error)
        setDocuments([])
      } finally {
        setIsLoading(false)
      }
    }

    if (!loading && user) {
      loadStories()
    } else if (!loading && !user) {
      setIsLoading(false)
    }
  }, [user, loading])

  const handleOpenDocument = (id: string) => {
    router.push(`/dashboard/storymaker/${id}`)
  }

  const handleCreateNew = () => {
    const newId = `story-${Date.now()}`
    router.push(`/dashboard/storymaker/${newId}`)
  }

  const handleDuplicate = async (e: React.MouseEvent, doc: StoryDocument) => {
    e.stopPropagation()
    if (!user) return

    try {
      const newId = await storiesService.duplicateStory(doc.id, user.uid)
      const updatedStories = await storiesService.getUserStories(user.uid)
      setDocuments(updatedStories)
    } catch (error) {
      console.error('Error duplicating story:', error)
    }
  }

  const handleDeleteClick = (e: React.MouseEvent, docId: string) => {
    console.log('DELETE: Delete button clicked', { docId })
    e.stopPropagation()
    setStoryToDelete(docId)
    setDeleteDialogOpen(true)
    console.log('DELETE: Dialog should now be open')
  }

  const handleDeleteConfirm = async () => {
    console.log('DELETE: handleDeleteConfirm started', { storyToDelete, user: !!user })
    
    if (!storyToDelete || !user) {
      console.log('DELETE: Early return - missing storyToDelete or user')
      return
    }

    console.log('DELETE: About to call storiesService.deleteStory')
    
    try {
      await storiesService.deleteStory(storyToDelete)
      console.log('DELETE: Successfully deleted story from Firebase')
      
      // Immediately update state to remove the deleted story
      setDocuments((prev) => {
        const newDocs = prev.filter((doc) => doc.id !== storyToDelete)
        console.log('DELETE: Updated documents state', { 
          oldCount: prev.length, 
          newCount: newDocs.length,
          deletedId: storyToDelete 
        })
        return newDocs
      })
      
      console.log('DELETE: State updated successfully')
    } catch (error) {
      console.error('DELETE: Error deleting story:', error)
    } finally {
      console.log('DELETE: In finally block - closing dialog')
      // Always close dialog and reset state
      setDeleteDialogOpen(false)
      setStoryToDelete(null)
      console.log('DELETE: Dialog closed and state reset')
    }
  }

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">Stories</h1>
          </div>
          <Button onClick={handleCreateNew} size="lg" className="bg-card">
            <Plus className="h-5 w-5 mr-2" />
            New
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Create New Project Div */}
        <div
          className="p-6 border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer group rounded-lg"
          onClick={handleCreateNew}
        >
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <Plus className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Create New Story</h3>
            <p className="text-sm text-muted-foreground">Start a new video storytelling project</p>
          </div>
        </div>

        {/* Existing Documents */}
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-all group rounded-lg border relative"
            onClick={() => handleOpenDocument(doc.id)}
          >
            <div className="aspect-video bg-muted overflow-hidden">
              <img
                src={doc.thumbnail || "/assets/images/storymaker/placeholder.jpg"}
                alt={doc.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="py-2">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-md font-semibold group-hover:text-primary transition-colors flex-1">
                  {doc.title}
                </h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => handleDuplicate(e, doc)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => handleDeleteClick(e, doc.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Updated {doc.updatedAt.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Story</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this story? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}