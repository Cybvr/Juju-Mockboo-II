"use client"
import { Button } from "@/components/ui/button"
import { Type, Heading1, Heading2, TextIcon } from "lucide-react"

interface TextPanelProps {
  onAddText?: (textType: 'title' | 'subtitle' | 'body') => void
}

export function TextPanel({ onAddText }: TextPanelProps) {
  const handleAddText = (textType: 'title' | 'subtitle' | 'body') => {
    if (onAddText) {
      onAddText(textType)
    }
  }

  return (
    <div className="w-80 border-r border-border bg-background flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Type className="w-4 h-4" />
          <h2 className="font-semibold text-sm">Text</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2 h-12"
            onClick={() => handleAddText('title')}
          >
            <Heading1 className="w-5 h-5" />
            <span>Add a title</span>
          </Button>

          <Button 
            variant="outline" 
            className="w-full justify-start gap-2 h-12"
            onClick={() => handleAddText('subtitle')}
          >
            <Heading2 className="w-5 h-5" />
            <span>Add a subtitle</span>
          </Button>

          <Button 
            variant="outline" 
            className="w-full justify-start gap-2 h-12"
            onClick={() => handleAddText('body')}
          >
            <TextIcon className="w-5 h-5" />
            <span>Add body text</span>
          </Button>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center text-muted-foreground text-center">
          <Type className="w-8 h-8 mb-2 opacity-50" />
          <p className="text-sm">Add text overlays</p>
          <p className="text-xs">Choose a text style above</p>
        </div>
      </div>
    </div>
  )
}