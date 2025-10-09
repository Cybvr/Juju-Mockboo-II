"use client"
import React from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type ThumbnailOption = {
  id: string
  name: string
  imageUrl?: string
}

interface ThumbnailSelectProps {
  options: ThumbnailOption[]
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
}

export function ThumbnailSelect({ options, value, onValueChange, placeholder = "Select..." }: ThumbnailSelectProps) {
  const selectedOption = options.find((option) => option.id === value)

  return (
    <Select value={value || ""} onValueChange={onValueChange}>
      <SelectTrigger className="w-full h-auto p-2 bg-transparent">
        <SelectValue asChild>
          {selectedOption ? (
            <div className="flex items-center gap-2 w-full">
              {selectedOption.imageUrl && (
                <img
                  src={selectedOption.imageUrl || "/placeholder.svg"}
                  alt={selectedOption.name}
                  className="w-8 h-8 rounded object-cover flex-shrink-0"
                />
              )}
              <span className="truncate text-sm">{selectedOption.name}</span>
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">{placeholder}</span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="w-[300px]">
        {options.map((option) => (
          <SelectItem key={option.id} value={option.id} className="flex items-center gap-2 cursor-pointer p-2">
            <div className="flex items-center gap-2 w-full">
              {option.imageUrl && (
                <img
                  src={option.imageUrl || "/placeholder.svg"}
                  alt={option.name}
                  className="w-10 h-10 rounded object-cover flex-shrink-0"
                />
              )}
              <span className="flex-1 truncate">{option.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}