"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  MousePointer2,
  Square,
  Circle,
  Upload,
  Share2,
  Home,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Hand,
  FileText,
  Pen,
  ChevronDown,
  Plus,
  Copy,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import ChatterBox from "../common/chatterbox"
import { documentService } from "@/services/documentService"
import { useAuth } from "@/hooks/useAuth"
import type { Document } from "@/types/document"
import { useCanvasState, useCanvasOperations } from "./canvas-hooks"
import { useFabricCanvas } from "./canvas-fabric"
import { useImageOperations } from "./hooks/use-image-operations"
import { GeneratingMedia } from "./GeneratingMedia"
import { ProfileDropdown } from "@/app/common/dashboard/ProfileDropdown"
import { ShareModal } from "@/components/ShareModal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"

type Tool = "select" | "pan" | "sticky" | "text" | "square" | "circle" | "pen"

export default function CanvasEditor() {
  const params = useParams()
  const router = useRouter()
  const { user, loading } = useAuth()
  const [document, setDocument] = useState<Document | null>(null)
  const [titleValue, setTitleValue] = useState("")
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [isViewOnly, setIsViewOnly] = useState(false)

  const documentId = params.id as string

  // Use extracted hooks
  const canvasState = useCanvasState()
  const operations = useCanvasOperations(canvasState.fabricCanvasRef, documentId, document, canvasState)

  // Image operations hook
  const imageOps = useImageOperations({
    fabricCanvasRef: canvasState.fabricCanvasRef,
    handleCanvasChange: operations.handleCanvasChange,
    userId: user?.uid,
  })

  // Initialize Fabric.js canvas
  const fabricHook = useFabricCanvas(document, documentId, canvasState, operations, setSelectedImages)
  const { snapGrid } = fabricHook

  // Load document from Firebase
  useEffect(() => {
    const loadDocument = async () => {
      if (!documentId) return

      try {
        const doc = await documentService.getDocumentById(documentId)
        if (!doc || doc.type !== "canvas") {
          router.push("/dashboard")
          return
        }

        setDocument(doc)
        setTitleValue(doc.title)

        // Only set view-only for non-owners with view access
        const isOwner = user && doc.userId === user.uid
        setIsViewOnly(!isOwner && doc.shareSettings?.accessLevel === "view")
      } catch (error) {
        console.error("Error loading document:", error)
      }
    }

    loadDocument()
  }, [documentId, user, router])

  const tools = [
    { id: "select" as Tool, icon: MousePointer2, label: "Select" },
    { id: "pan" as Tool, icon: Hand, label: "Pan" },
    { id: "pen" as Tool, icon: Pen, label: "Draw" },
    { id: "sticky" as Tool, icon: FileText, label: "Sticky Note" },
    { id: "square" as Tool, icon: Square, label: "Rectangle" },
    { id: "circle" as Tool, icon: Circle, label: "Circle" },
  ]

  const handleBack = () => router.push("/dashboard")

  const handleTitleSave = async () => {
    if (!document || !user || titleValue.trim() === "" || titleValue.trim() === document.title) return

    try {
      await documentService.updateDocument(documentId, {
        title: titleValue.trim(),
      })
      setDocument({ ...document, title: titleValue.trim() })
    } catch (error) {
      console.error("Error updating title:", error)
    }
  }

  const handleTitleCancel = () => {
    setTitleValue(document?.title || "")
  }

  if (loading || !document) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full overflow-hidden" data-user-id={user?.uid}>
      {/* Floating Toolbar */}
      <div className="flex items-center gap-4 absolute left-4 top-4 z-10 bg-card rounded-xl px-4 py-2">
        {/* Logo Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 flex items-center gap-2"
            >
              <div className="relative w-6 h-6">
                <Image
                  src="/assets/images/logowhite.png"
                  alt="Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-40">
            <DropdownMenuItem onClick={handleBack} className="text-xs py-1 text-muted-foreground">
              <Home className="h-3 w-3 mr-1.5" />
              Back Home
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs py-1 text-muted-foreground">
              <Plus className="h-3 w-3 mr-1.5" />
              Create New Design
            </DropdownMenuItem>
            <DropdownMenuItem className="text-xs py-1 text-muted-foreground">
              <Copy className="h-3 w-3 mr-1.5" />
              Duplicate Design
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs py-1 text-red-600 focus:text-red-600">
              <Trash2 className="h-3 w-3 mr-1.5" />
              Move to Trash
            </DropdownMenuItem>
            {!isViewOnly && canvasState.lastSaved && (
              <>
                <DropdownMenuSeparator />
                <div className="px-2 py-1 text-xs text-muted-foreground">
                  {canvasState.isSaving ? "Saving..." : `Saved ${canvasState.lastSaved.toLocaleTimeString()}`}
                </div>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Title */}
        <div className="flex items-center gap-2">
          {isViewOnly ? (
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold">{titleValue}</h1>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">View Only</span>
            </div>
          ) : (
            <Input
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur()
                if (e.key === "Escape") {
                  handleTitleCancel()
                  e.currentTarget.blur()
                }
              }}
              className="h-8 text-lg font-bold bg-transparent border-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              style={{ width: `${Math.max(titleValue.length * 12, 120)}px` }}
            />
          )}
        </div>
      </div>

      {/* Profile and Share Buttons */}
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
        <ProfileDropdown />
        <Button variant="default" onClick={() => setShowShareModal(true)} className="h-10 px-4" title="Share">
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </div>

      {/* Controls Panel */}
      <div className="absolute right-4 top-1/2 z-10 -translate-y-1/2">
        <div className="flex flex-col gap-2 rounded-lg bg-card p-2 shadow-lg border w-12">
          <Button variant="ghost" size="icon" onClick={operations.handleZoomIn} className="h-8 w-8" title="Zoom In">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <div className="text-xs text-center text-muted-foreground px-1">
            {Math.round(canvasState.zoomLevel * 100)}%
          </div>
          <Button variant="ghost" size="icon" onClick={operations.handleZoomOut} className="h-8 w-8" title="Zoom Out">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={operations.handleResetZoom}
            className="h-8 w-8"
            title="Reset Zoom"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <div className="h-px bg-border my-1"></div>
        </div>
      </div>

      {/* Floating Toolbar - Hide in view-only mode */}
      {!isViewOnly && (
        <div className="absolute left-4 top-1/2 z-10 -translate-y-1/2">
          <div className="flex flex-col gap-2 rounded-lg bg-card p-2 shadow-lg border">
            {tools.map((tool) => {
              const Icon = tool.icon
              return (
                <Button
                  key={tool.id}
                  variant={canvasState.activeTool === tool.id ? "default" : "ghost"}
                  size="icon"
                  onClick={() => operations.setActiveTool(tool.id)}
                  className={cn(
                    "h-10 w-10",
                    canvasState.activeTool === tool.id && "bg-primary text-primary-foreground",
                  )}
                  title={tool.label}
                >
                  <Icon className="h-5 w-5" />
                </Button>
              )
            })}

            <label htmlFor="image-upload" className="cursor-pointer">
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    imageOps.handleFileUpload(file)
                    e.target.value = ""
                  }
                }}
                className="hidden"
              />
              <Button variant="ghost" size="icon" className="h-10 w-10" title="Upload Image" asChild>
                <div>
                  <Upload className="h-5 w-5" />
                </div>
              </Button>
            </label>
          </div>
        </div>
      )}

      {/* ChatterBox */}
      {!isViewOnly && (
        <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 transform w-full max-w-2xl p-4">
          <ChatterBox
            selectedImages={selectedImages}
            onImageGenerated={async (imageUrl) => {
              console.log("Page: Received generated image, handling storage and canvas:", imageUrl)

              try {
                // Just add to canvas - it will auto-save the canvas state
                if (fabricHook.addImageToCanvas) {
                  await fabricHook.addImageToCanvas(imageUrl)
                  // Force canvas save immediately to persist the new image
                  setTimeout(() => {
                    operations.saveCanvasState()
                    console.log("Page: Canvas state saved after image generation")
                  }, 500)
                } else {
                  console.error("Page: addImageToCanvas function not available")
                }
              } catch (error) {
                console.error("Page: Failed to add image to canvas:", error)
              }

              setIsGenerating(false)
            }}
            onGenerationStart={() => setIsGenerating(true)}
            onGenerationEnd={() => setIsGenerating(false)}
          />
        </div>
      )}

      {/* Canvas area */}
      <div className="fixed inset-0 w-screen h-screen overflow-hidden" style={{ zIndex: 0 }}>
        <canvas
          ref={canvasState.canvasRef}
          className="block border-none outline-none"
          style={{ 
            width: "100vw", 
            height: "100vh", 
            touchAction: "none",
            position: "absolute",
            top: 0,
            left: 0
          }}
        />

        {isGenerating && <GeneratingMedia isVisible={true} message="Generating image..." />}

        {fabricHook.FloatingToolbarComponent()}
      </div>

      {/* Share Modal */}
      <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} document={document} type="canvas" />
    </div>
  )
}