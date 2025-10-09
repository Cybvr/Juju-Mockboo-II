"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/hooks/useAuth"
import { documentService } from "@/services/documentService"
import type { Document } from "@/types/firebase"
import { Search, X } from "lucide-react"

interface DocumentPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onImageSelect: (imageUrl: string, imageName: string) => void
  title: string
}

export function DocumentPickerModal({ 
  isOpen, 
  onClose, 
  onImageSelect, 
  title 
}: DocumentPickerModalProps) {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadDocuments = async () => {
      if (!user || !isOpen) return

      setLoading(true)
      try {
        const userDocs = await documentService.getUserRecentDocuments(user.uid, 100)
        // Filter to only image documents
        const imageDocs = userDocs.filter(doc => 
          doc.type === "image" && 
          doc.content?.imageUrls && 
          doc.content.imageUrls.length > 0
        )
        setDocuments(imageDocs)
        setFilteredDocuments(imageDocs)
      } catch (error) {
        console.error("Failed to load documents:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDocuments()
  }, [user, isOpen])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredDocuments(documents)
    } else {
      const filtered = documents.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      setFilteredDocuments(filtered)
    }
  }, [searchQuery, documents])

  const handleImageSelect = (doc: Document, imageUrl: string) => {
    onImageSelect(imageUrl, doc.title)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative flex-shrink-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your images..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 min-h-0">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredDocuments.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
              {filteredDocuments.map((doc) => (
                <div key={doc.id} className="space-y-2">
                  <div className="aspect-square relative group cursor-pointer rounded-lg overflow-hidden border hover:border-primary transition-colors">
                    {doc.content?.imageUrls?.map((imageUrl, index) => (
                      <div
                        key={index}
                        className="w-full h-full relative"
                        onClick={() => handleImageSelect(doc, imageUrl)}
                      >
                        <img
                          src={imageUrl}
                          alt={`${doc.title} ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="sm" variant="secondary">
                              Select
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {doc.title}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-muted-foreground mb-2">No images found</div>
              <div className="text-sm text-muted-foreground">
                {searchQuery ? "Try a different search term" : "Create some images first"}
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}