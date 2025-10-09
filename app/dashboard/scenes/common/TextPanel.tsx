"use client"
import { Button } from "@/components/ui/button"
import { X, Type, AlignLeft, AlignCenter, AlignRight } from "lucide-react"

interface TextPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function TextPanel({ isOpen, onClose }: TextPanelProps) {
  if (!isOpen) return null

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
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Text Input */}
        <div className="space-y-2">
          <label className="text-xs font-medium">Content</label>
          <textarea
            className="w-full min-h-24 px-3 py-2 text-sm border border-border rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Enter your text..."
          />
        </div>

        {/* Font Size */}
        <div className="space-y-2">
          <label className="text-xs font-medium">Font Size</label>
          <input
            type="number"
            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            defaultValue={16}
            min={8}
            max={200}
          />
        </div>

        {/* Text Alignment */}
        <div className="space-y-2">
          <label className="text-xs font-medium">Alignment</label>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8"
            >
              <AlignLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8"
            >
              <AlignCenter className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8"
            >
              <AlignRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Color */}
        <div className="space-y-2">
          <label className="text-xs font-medium">Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              className="w-12 h-8 rounded border border-border cursor-pointer"
              defaultValue="#000000"
            />
            <input
              type="text"
              className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              defaultValue="#000000"
            />
          </div>
        </div>

        {/* Font Weight */}
        <div className="space-y-2">
          <label className="text-xs font-medium">Font Weight</label>
          <select className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="300">Light</option>
            <option value="400">Regular</option>
            <option value="500">Medium</option>
            <option value="600">Semibold</option>
            <option value="700">Bold</option>
          </select>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <Button className="w-full" size="sm">
          Add Text
        </Button>
      </div>
    </div>
  )
}