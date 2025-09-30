"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { type JujuTemplate, jujuTemplates } from "./videoTemplates"
import { X } from "lucide-react"
import Image from "next/image"
import { useState, useMemo } from "react"

interface TemplateChooserModalProps {
  isOpen: boolean
  onClose: () => void
  onTemplateSelect: (template: JujuTemplate) => void
}

export function TemplateChooserModal({ isOpen, onClose, onTemplateSelect }: TemplateChooserModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All")

  const categories = useMemo(() => 
    ["All", ...Array.from(new Set(jujuTemplates.flatMap(t => t.tags)))], 
    []
  )

  const filteredTemplates = useMemo(() => 
    selectedCategory === "All" 
      ? jujuTemplates 
      : jujuTemplates.filter(t => t.tags.includes(selectedCategory)),
    [selectedCategory]
  )

  const handleSelect = (template: JujuTemplate) => {
    onTemplateSelect(template)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[80vh] p-0 flex flex-col">
        <DialogHeader className="px-6 py-2 border-b">
          <DialogTitle className="text-xl font-normal text-muted-background">Templates</DialogTitle>
        </DialogHeader>

        {/* Category Pills */}
        <div className="px-6  border-b ">
          <div className="flex overflow-x-auto gap-2 scrollbar-hide">
            {categories.map(category => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer px-3 py-1.5 text-sm whitespace-nowrap flex-shrink-0"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {/* Template Grid */}
        <div className="flex-1 overflow-y-auto px-6 ">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                onClick={() => handleSelect(template)}
                className="group cursor-pointer space-y-3 
                rounded-xl"
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={template.thumbnailImage || "/placeholder.svg"}
                    alt=""
                    width={300}
                    height={300}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-sm font-medium leading-tight text-foreground hover-text-muted-foreground">
                  {template.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}