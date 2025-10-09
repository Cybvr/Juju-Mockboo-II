"use client"
import { Button } from "@/components/ui/button"
import { X, Type, Heading1, Heading2, TextIcon } from "lucide-react"

interface TextPanelProps {
  isOpen: boolean
  onClose: () => void
  onAddText?: (textType: 'title' | 'subtitle' | 'body', text: string) => void
}

export function TextPanel({ isOpen, onClose, onAddText }: TextPanelProps) {
  if (!isOpen) return null

  const handleAddText = (textType: 'title' | 'subtitle' | 'body') => {
    const defaultTexts = {
      title: "Your Title Here",
      subtitle: "Your Subtitle Here", 
      body: "Your text here"
    }
    
    if (onAddText) {
      onAddText(textType, defaultTexts[textType])
    }
  }

  return (
    <div className="w-64 border-r border-border bg-card/50 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4" />
          <h3 className="font-semibold text-sm">Text</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-6 h-6 p-0"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
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
    </div>
  )
}