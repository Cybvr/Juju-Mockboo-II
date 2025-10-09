
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Share, GripVertical } from "lucide-react"
import { ProfileDropdown } from "@/app/common/dashboard/ProfileDropdown"
import Image from "next/image"

interface ScenesHeaderProps {
  projectTitle: string
  setProjectTitle: (title: string) => void
  isSaving: boolean
  scenesCount: number
  totalDuration: number
  isExporting: boolean
  onExport: () => void
}

export function ScenesHeader({
  projectTitle,
  setProjectTitle,
  isSaving,
  scenesCount,
  totalDuration,
  isExporting,
  onExport
}: ScenesHeaderProps) {
  return (
    <div className="h-12 border-b border-border flex items-center justify-between px-2 sm:px-4 bg-card/50">
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <Image
          src="/assets/images/videos/vids.png"
          alt="Videos"
          width={24}
          height={24}
          className="shrink-0"
        />
        <input
          type="text"
          value={projectTitle}
          onChange={(e) => setProjectTitle(e.target.value)}
          className="text-sm font-medium bg-transparent border-none outline-none focus:bg-background/50 px-1 sm:px-2 py-1 rounded flex-1 min-w-0"
        />
        {isSaving && (
          <div className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span className="hidden sm:inline">Saving...</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <div className="text-xs text-muted-foreground hidden sm:block">
          {scenesCount} scenes • {totalDuration.toFixed(1)}s total
        </div>
        <Button
          onClick={onExport}
          disabled={isExporting || scenesCount === 0}
          className="bg-primary text-primary-foreground text-xs sm:text-sm px-2 sm:px-4"
          size="sm"
        >
          {isExporting ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1 sm:mr-2" />
          ) : null}
          <span className="hidden sm:inline">{isExporting ? "Sharing..." : "Share"}</span>
          <span className="sm:hidden">{isExporting ? "Share..." : "Share"}</span>
        </Button>
        <Button variant="ghost" size="sm" className="p-2">
          <GripVertical className="w-4 h-4" />
        </Button>
        <ProfileDropdown />
      </div>
    </div>
  )
}
