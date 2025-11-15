"use client"

import { Button } from "@/components/ui/button"
import { Palette } from "lucide-react"
import { STYLE_TEMPLATES, getStylePrompt } from "./styleTemplates"

interface VisualRestylePanelProps {
  selectedStyle: string;
  onStyleSelect: (styleId: string) => void;
}

export { getStylePrompt };

export function VisualRestylePanel({ selectedStyle, onStyleSelect }: VisualRestylePanelProps) {
  return (
    <div className="mb-4 lg:mb-6">
      <h2 className="text-sm font-normal mb-3 flex items-center">
        <Palette className="w-4 h-4 mr-2" />
        Style
      </h2>
      <div className="grid grid-cols-3 gap-2">
        {STYLE_TEMPLATES.map((style) => (
          <button
            key={style.id}
            onClick={() => onStyleSelect(style.id)}
            className={`
              relative rounded-lg overflow-hidden border-2 transition-all
              ${selectedStyle === style.id 
                ? 'border-primary shadow-lg scale-105' 
                : 'border-border hover:border-primary/50'
              }
            `}
          >
            <img
              src={style.thumbnail}
              alt={style.name}
              className="w-full aspect-square object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1">
              <div className="text-xs text-white font-medium text-center truncate">
                {style.name}
              </div>
            </div>
            {selectedStyle === style.id && (
              <div className="absolute top-1 right-1 w-3 h-3 bg-primary rounded-full border border-white" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}