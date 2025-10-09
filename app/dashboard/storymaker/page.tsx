
"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, FileText, Calendar, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { storiesService, StoryDocument } from "@/services/storiesService"

export default function StorymakerDocumentsPage() {
  const router = useRouter()
  const [user, loading] = useAuthState(auth)
  const [documents, setDocuments] = useState<StoryDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadStories = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        const userStories = await storiesService.getUserStories(user.uid)
        setDocuments(userStories)
      } catch (error) {
        console.error('Error loading stories:', error)
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
            <h1 className="text-xl font-bold ">Stories</h1>
            
          </div>
          <Button onClick={handleCreateNew} size="lg" className="bg-card" >
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
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-all group rounded-lg border"
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
              <h3 className="text-md font-semibold mb-2 group-hover:text-primary transition-colors">
                {doc.title}
              </h3>

              <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>{doc.scenes?.length || 0} scenes</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>You</span>
                </div>
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
      {documents.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <FileText className="h-12 w-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">No story projects yet</h2>
          <p className="text-muted-foreground mb-6">Create your first video storytelling project to get started</p>
          <Button onClick={handleCreateNew} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Create Your First Story
          </Button>
        </div>
      )}
    </div>
  )
}
