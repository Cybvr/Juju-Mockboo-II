"use client"
import { useState, useEffect } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { DocumentGallery } from "@/app/common/dashboard/DocumentGallery"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilm, faPaintBrush, faVideo } from '@fortawesome/free-solid-svg-icons';

export default function DashboardPage() {
  const [user, loading] = useAuthState(auth)
  const [activeView, setActiveView] = useState("documents")
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  const createNewCanvas = async () => {
    if (!user) return;
    try {
      const { documentService } = await import('@/services/documentService');
      const canvasDocument = await documentService.createDocument(user.uid, {
        title: 'New Canvas',
        content: {
          elements: [],
          version: '1.0',
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
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden mx-auto max-w-4xl">
      <main className="flex-1 overflow-y-auto p-3 lg:p-6">
        {activeView === "documents" && (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-4 mb-2 md:gap-6">
              <Button
                onClick={createNewCanvas}
                className="h-24 flex flex-col items-center justify-center space-y-2 bg-card text-card-foreground hover:bg-card/90 border"
              >
                <FontAwesomeIcon icon={faPaintBrush} className="h-6 w-6" />
                <span>Canvas</span>
              </Button>
              <Button
                onClick={() => router.push("/dashboard/videos")}
                className="h-24 flex flex-col items-center justify-center space-y-2 bg-card text-card-foreground hover:bg-card/90 border"
              >
                <FontAwesomeIcon icon={faVideo} className="h-6 w-6" />
                <span>Video</span>
              </Button>
              <Button
                onClick={() => router.push("/dashboard/stories")}
                className="h-24 flex flex-col items-center justify-center space-y-2 bg-card text-card-foreground hover:bg-card/90 border"
              >
                <FontAwesomeIcon icon={faFilm} className="h-6 w-6" />
                <span>Stories</span>
              </Button>
            </div>
            <DocumentGallery />
          </div>
        )}
      </main>
    </div>
  )
}