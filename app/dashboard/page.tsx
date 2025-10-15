"use client"
import { useState, useEffect } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { DocumentGallery } from "@/app/common/dashboard/DocumentGallery"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { FileText, Palette, Video } from "lucide-react"

export default function DashboardPage() {
  const [user, loading] = useAuthState(auth)
  const [activeView, setActiveView] = useState("documents")
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

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
    <div className="flex-1 flex flex-col overflow-hidden">
      <main className="flex-1 overflow-y-auto p-6">
        {activeView === "documents" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Button
                onClick={() => router.push("/dashboard/canvas/new")}
                className="h-24 flex flex-col items-center justify-center space-y-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Palette className="h-6 w-6" />
                <span>Create Canvas</span>
              </Button>

              <Button
                onClick={() => router.push("/dashboard/videos")}
                className="h-24 flex flex-col items-center justify-center space-y-2 bg-blue-600 text-white hover:bg-blue-700"
              >
                <Video className="h-6 w-6" />
                <span>Create Video</span>
              </Button>
              <Button
                onClick={() => router.push("/dashboard/templates")}
                className="h-24 flex flex-col items-center justify-center space-y-2 bg-green-600 text-white hover:bg-green-700"
              >
                <FileText className="h-6 w-6" />
                <span>Browse Templates</span>
              </Button>
            </div>

            <DocumentGallery />
          </div>
        )}
      </main>
    </div>
  )
}
