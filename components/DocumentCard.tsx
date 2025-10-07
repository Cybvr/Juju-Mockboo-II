"use client"
import { FileImage, MoreVertical, Download, Edit2, Trash2, Heart, Plus } from "lucide-react"
import type React from "react"
import { useRef, useEffect, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"

interface DocumentCardProps {
  document: {
    id: string
    name: string
    modified: string
    thumbnail?: string
    type: string
    size?: string
  }
  onDelete?: (id: string) => void
  onRename?: (id: string) => void
  onLike?: (id: string, isLiked: boolean) => void
  onDownload?: (id: string, thumbnail: string, name: string) => void
  onDuplicate?: (id: string) => void
  isLiked?: boolean
  onClick?: () => void
  onAddToBoard?: (documentId: string, imageUrl: string) => void
  hideMetadata?: boolean
  mediaType?: 'image' | 'video'
}

export function DocumentCard({
  document,
  onDelete,
  onRename,
  onLike,
  onDownload,
  onDuplicate,
  isLiked = false,
  onClick,
  onAddToBoard,
  hideMetadata = false,
  mediaType
}: DocumentCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  // Cleanup video when component unmounts
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current.src = ""
        videoRef.current.load()
      }
    }
  }, [])

  const getFileIcon = (type: string) => {
    return <FileImage className="h-8 w-8 text-green-500" />
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on action buttons or dropdown menu
    if (
      (e.target as HTMLElement).closest("[data-dropdown-trigger]") ||
      (e.target as HTMLElement).closest(".action-button")
    ) {
      return
    }
    if (onClick) {
      onClick()
    }
  }

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDownload && document.thumbnail) {
      onDownload(document.id, document.thumbnail, document.name)
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Clean up video before deletion
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.src = ""
    }
    if (onDelete) {
      onDelete(document.id)
    }
  }

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onRename) {
      onRename(document.id)
    }
  }

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onLike) {
      onLike(document.id, !isLiked)
    }
  }

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDuplicate) {
      onDuplicate(document.id)
    }
  }

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.target as HTMLVideoElement
    const fallback = video.nextElementSibling as HTMLElement
    video.style.display = 'none'
    if (fallback) {
      fallback.classList.remove('hidden')
    }
  }

  return (
    <div
      className="group relative hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="py-4">
        {/* Action buttons overlay */}
        <div className="absolute top-6 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild data-dropdown-trigger>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 bg-background hover:bg-background shadow-sm action-button"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={handleLike} className="px-3 py-2">
                <Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-red-500 text-red-500" : "text-foreground"}`} />
                {isLiked ? "Unlike" : "Like"}
              </DropdownMenuItem>
              {onAddToBoard && document.thumbnail && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToBoard(document.id, document.thumbnail!);
                  }}
                  className="px-3 py-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Board
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => onRename && onRename(document.id)}
                className="text-foreground hover:bg-muted"
              >
                <Edit className="mr-2 h-4 w-4" />
                Rename
              </DropdownMenuItem>
              {onDuplicate && (
                <DropdownMenuItem onClick={handleDuplicate} className="px-3 py-2">
                  <Edit className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
              )}
              {document.type === 'image' && (
                <DropdownMenuItem
                  onClick={() => window.open(`/dashboard/images/${document.id.split('-')[0]}`, '_blank')}
                  className="text-foreground hover:bg-muted"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Image
                </DropdownMenuItem>
              )}
              {document.thumbnail && (
                <DropdownMenuItem onClick={handleDownload} className="px-3 py-2">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive px-3 py-2" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="aspect-square mb-3 flex items-center justify-center bg-white rounded-lg overflow-hidden">
          {document.type === "video" && document.thumbnail ? (
            <>
              <video
                ref={videoRef}
                src={document.thumbnail}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover rounded-lg"
                onError={handleVideoError}
              />
              <div className="hidden w-full h-full flex items-center justify-center">
                {getFileIcon(document.type)}
              </div>
            </>
          ) : document.thumbnail ? (
            <img
              src={document.thumbnail || "/placeholder.svg"}
              alt={document.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            getFileIcon(document.type)
          )}
        </div>
        <div>
          <h3 className="font-medium text-sm truncate mb-1">{document.name}</h3>
          <p className="text-xs text-muted-foreground">{document.modified}</p>
          {document.size && <p className="text-xs text-muted-foreground">{document.size}</p>}
        </div>
      </div>
    </div>
  )
}
