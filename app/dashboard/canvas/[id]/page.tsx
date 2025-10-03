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
  Pen,
  Type,
  StickyNote,
  ChevronDown,
  Plus,
  Copy,
  Trash2,
} from "lucide-react"
import ChatterBox from "../common/chatterbox"
import { documentService } from "@/services/documentService"
import { useAuth } from "@/hooks/useAuth"
import type { Document } from "@/types/firebase"
import { useCanvasCore } from "./hooks/use-canvas-core"
import { useImageOperations } from "./hooks/use-image-operations"
import { GeneratingMedia } from "./GeneratingMedia"
import { ProfileDropdown } from "@/app/common/dashboard/ProfileDropdown"
import { ShareModal } from "@/components/ShareModal"
import { useSnapGrid } from "./hooks/use-snap-grid"
import { FloatingToolbar } from "./toolbars/image-toolbar"

import { StickyNoteToolbar } from "./toolbars/sticky-note-toolbar"
import { TextToolbar } from "./toolbars/text-toolbar"
import { useFabricCanvas } from "./canvas-fabric"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"

type Tool = "select" | "pan" | "pen" | "text" | "sticky-note" | "square" | "circle"

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

  // Use fabric canvas hook for canvas initialization - this includes canvasCore internally
  const { FloatingToolbarComponent, addImageToCanvas, canvasRef: fabricCanvasRef, snapGrid, canvasCore } = useFabricCanvas(
    document,
    documentId,
    (images) => setSelectedImages(images)
  )
  
  // Image operations hook
  const imageOps = useImageOperations({
    fabricCanvasRef: canvasCore.fabricCanvasRef,
    handleCanvasChange: canvasCore.handleCanvasChange,
    userId: user?.uid,
  })

  // Sticky note hook
  const { useStickyNote } = require("./hooks/use-sticky-note")
  const { createStickyNote, setupStickyNoteInteractions } = useStickyNote({
    fabricCanvasRef: canvasCore.fabricCanvasRef,
    handleCanvasChange: canvasCore.handleCanvasChange,
  })

  // Text tool hook
  const { useTextTool } = require("./hooks/use-text-tool")
  const { createTextObject, setupTextInteractions } = useTextTool({
    fabricCanvasRef: canvasCore.fabricCanvasRef,
    handleCanvasChange: canvasCore.handleCanvasChange,
  })

  // Expose hooks to global for interaction hook
  useEffect(() => {
    window.stickyNoteHook = { createStickyNote }
    window.textToolHook = { createTextObject }
    return () => {
      delete window.stickyNoteHook
      delete window.textToolHook
    }
  }, [createStickyNote, createTextObject])

  // Import and setup interaction hook
  const { useInteractionHook } = require("./hooks/use-interaction-hook")
  const { setupInteractions, setupKeyboardHandlers, setupPanAndZoom, setupTouchHandlers } = useInteractionHook({
    fabricCanvasRef: canvasCore.fabricCanvasRef,
    handleCanvasChange: canvasCore.handleCanvasChange,
    activeToolRef: canvasCore.activeToolRef,
    isDrawingRef: canvasCore.isDrawingRef,
    setIsDrawing: canvasCore.setIsDrawing,
    setActiveTool: canvasCore.setActiveTool,
    brushSize: canvasCore.brushSize,
    brushColor: canvasCore.brushColor,
    drawingMode: canvasCore.drawingMode,
  })
  


  // Setup interactions after canvas is loaded
  useEffect(() => {
    if (!canvasCore.fabricLoaded || !canvasCore.fabricCanvasRef.current) return

    const cleanupInteractions = setupInteractions()
    const cleanupKeyboard = setupKeyboardHandlers()
    const cleanupPanZoom = setupPanAndZoom()
    const cleanupTouch = setupTouchHandlers()
    const cleanupDragDrop = imageOps.setupDragAndDrop()
    const cleanupStickyNote = setupStickyNoteInteractions()
    const cleanupTextTool = setupTextInteractions()

    return () => {
      if (cleanupInteractions) cleanupInteractions()
      if (cleanupKeyboard) cleanupKeyboard()
      if (cleanupPanZoom) cleanupPanZoom()
      if (cleanupTouch) cleanupTouch()
      if (cleanupDragDrop) cleanupDragDrop()
      if (cleanupStickyNote) cleanupStickyNote()
      if (cleanupTextTool) cleanupTextTool()
    }
  }, [canvasCore.fabricLoaded, setupInteractions, setupKeyboardHandlers, setupPanAndZoom, setupTouchHandlers, imageOps.setupDragAndDrop])

  // Canvas initialization is handled by useFabricCanvas hook
  
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
    { id: "text" as Tool, icon: Type, label: "Text" },
    { id: "sticky-note" as Tool, icon: StickyNote, label: "Sticky Note" },
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
      <div className="flex items-center gap-2 absolute left-4 top-4 z-10 bg-background rounded-xl px-4 py-2">
        {/* Logo Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className=" px-2 flex items-center gap-2"
            >
              <div className="relative w-4 h-4">
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
            {!isViewOnly && canvasCore.lastSaved && (
              <>
                <DropdownMenuSeparator />
                <div className="px-2 py-1 text-xs text-muted-foreground">
                  {canvasCore.isSaving ? "Saving..." : `Saved ${canvasCore.lastSaved.toLocaleTimeString()}`}
                </div>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Title */}
        <div className="flex items-left gap-2">
          {isViewOnly ? (
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-normal">{titleValue}</h1>
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
        className="h-6 text-sm font-semibold bg-transparent border-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0 w-auto max-w-[100px]"
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
        <div className="flex flex-col gap-2 rounded-lg bg-background p-2 shadow-lg border w-12">
          <Button variant="ghost" size="icon" onClick={canvasCore.handleZoomIn} className="h-8 w-8" title="Zoom In">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <div className="text-xs text-center text-muted-foreground px-1">
            {Math.round(canvasCore.zoomLevel * 100)}%
          </div>
          <Button variant="ghost" size="icon" onClick={canvasCore.handleZoomOut} className="h-8 w-8" title="Zoom Out">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={canvasCore.handleResetZoom}
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
          <div className="flex flex-col gap-2 rounded-lg bg-background p-2 shadow-lg border">
            {tools.map((tool) => {
              const Icon = tool.icon
              return (
                <Button
                  key={tool.id}
                  variant={canvasCore.activeTool === tool.id ? "default" : "ghost"}
                  size="icon"
                  onClick={() => {
                    canvasCore.setActiveTool(tool.id)
                  }}
                  className="h-10 w-10"
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
              try {
                if (imageOps.addImageToCanvas) {
                  await imageOps.addImageToCanvas(imageUrl)
                  setTimeout(() => {
                    canvasCore.saveCanvasState()
                  }, 500)
                }
              } catch (error) {
                console.error("Failed to add image to canvas:", error)
              }
              setIsGenerating(false)
            }}
            onGenerationStart={() => setIsGenerating(true)}
            onGenerationEnd={() => setIsGenerating(false)}
          />
        </div>
      )}

      {/* Floating Toolbar for Selected Images */}
      {!isViewOnly && (
        <FloatingToolbar
          selectedObjects={canvasCore.selectedObjects}
          fabricCanvas={canvasCore.fabricCanvasRef.current}
          onCopy={() => imageOps.copyImageToClipboard()}
          onDuplicate={() => imageOps.duplicateSelectedImages()}
          onDownload={() => imageOps.downloadSelectedImages()}
          onRegenerate={() => imageOps.generateImageVariations()}
          onVariations={() => imageOps.generateImageVariations()}
          onStyleApply={(style) => imageOps.applyStyleToImage(style)}
          onVideo={() => {}}
          onUpscale={() => {}}
        />
      )}
      

      

      {/* Text Toolbar */}
      {!isViewOnly && (
        <TextToolbar
          isVisible={canvasCore.selectedObjects.length === 1 && (canvasCore.selectedObjects[0]?.type === "textbox" || canvasCore.selectedObjects[0]?.type === "i-text" || canvasCore.selectedObjects[0]?.isTextObject)}
          selectedTextObject={canvasCore.selectedObjects.find(obj => obj.type === "textbox" || obj.type === "i-text" || obj.isTextObject)}
          fabricCanvas={canvasCore.fabricCanvasRef.current}
          onTextChange={canvasCore.handleCanvasChange}
        />
      )}

      {/* Canvas area */}
      <div className="fixed inset-0 w-screen h-screen overflow-hidden" style={{ zIndex: 0 }}>
        <canvas
          ref={fabricCanvasRef}
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
      </div>

      {/* Share Modal */}
      <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} document={document} type="canvas" />
    </div>
  )
}