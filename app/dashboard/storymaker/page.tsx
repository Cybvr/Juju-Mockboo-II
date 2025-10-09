"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, FileText, Calendar, User } from "lucide-react"
import { useRouter } from "next/navigation"

interface StorymakerDocument {
  id: string
  title: string
  description: string
  thumbnail: string
  createdAt: string
  updatedAt: string
  author: string
  scenes: number
}

export default function StorymakerDocumentsPage() {
  const router = useRouter()
  const [documents] = useState<StorymakerDocument[]>([
    {
      id: "lumiere-parfum",
      title: "Lumière Parfum Studio",
      description: "Elegant fragrance commercial showcasing the artistry and sophistication of Lumière Parfum through cinematic storytelling",
      thumbnail: "/assets/images/storymaker/luxury-perfume-bottle-on-white-marble-pedestal-wit.jpg",
      createdAt: "2024-01-15",
      updatedAt: "2024-01-20",
      author: "You",
      scenes: 3
    },
    {
      id: "product-launch",
      title: "Product Launch Campaign",
      description: "Dynamic product reveal campaign with multiple character perspectives",
      thumbnail: "/assets/images/storymaker/young-asian-woman-in-minimalist-black-outfit-holdi.jpg",
      createdAt: "2024-01-10",
      updatedAt: "2024-01-18",
      author: "You",
      scenes: 5
    },
    {
      id: "travel-adventure",
      title: "Paris Travel Story",
      description: "Cinematic travel documentary through the streets of Paris",
      thumbnail: "/assets/images/storymaker/paris-eiffel-tower-romantic.png",
      createdAt: "2024-01-08",
      updatedAt: "2024-01-16",
      author: "You",
      scenes: 4
    }
  ])

  const handleOpenDocument = (id: string) => {
    router.push(`/dashboard/storymaker/${id}`)
  }

  const handleCreateNew = () => {
    const newId = `story-${Date.now()}`
    router.push(`/dashboard/storymaker/${newId}`)
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
                src={doc.thumbnail}
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
                  <span>{doc.scenes} scenes</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{doc.author}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Updated {doc.updatedAt}</span>
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
