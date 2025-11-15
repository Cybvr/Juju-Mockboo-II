"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Share, GripVertical } from "lucide-react"
import { ProfileDropdown } from "@/app/common/dashboard/ProfileDropdown"
import Image from "next/image"
import Link from "next/link"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

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
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Link href="/dashboard">
          <Image
            src="/assets/videos/vids.png"
            alt="Videos"
            width={24}
            height={24}
            className="shrink-0"
          />
        </Link>
        <input
          type="text"
          value={projectTitle}
          onChange={(e) => setProjectTitle(e.target.value)}
          className="text-sm font-medium bg-transparent border-none outline-none focus:bg-background/50 px-1 sm:px-2 py-1 rounded min-w-0 max-w-[200px]"
        />
        {isSaving && (
          <div className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span className="hidden sm:inline">Saving...</span>
          </div>
        )}
        {/* Navigation Menu */}
        <NavigationMenu className="ml-2">
          <NavigationMenuList className="gap-0">
            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-sm h-8 px-2 data-[state=open]:bg-transparent hover:bg-transparent [&>svg]:hidden">
                File
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-48 p-2">
                  <NavigationMenuLink className="block px-3 py-2 text-sm hover:bg-accent rounded cursor-pointer">
                    New Project
                  </NavigationMenuLink>
                  <NavigationMenuLink className="block px-3 py-2 text-sm hover:bg-accent rounded cursor-pointer">
                    Open
                  </NavigationMenuLink>
                  <NavigationMenuLink className="block px-3 py-2 text-sm hover:bg-accent rounded cursor-pointer">
                    Save
                  </NavigationMenuLink>
                  <NavigationMenuLink className="block px-3 py-2 text-sm hover:bg-accent rounded cursor-pointer">
                    Export
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-sm h-8 px-2 data-[state=open]:bg-transparent hover:bg-transparent [&>svg]:hidden">
                View
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-48 p-2">
                  <NavigationMenuLink className="block px-3 py-2 text-sm hover:bg-accent rounded cursor-pointer">
                    Timeline
                  </NavigationMenuLink>
                  <NavigationMenuLink className="block px-3 py-2 text-sm hover:bg-accent rounded cursor-pointer">
                    Properties
                  </NavigationMenuLink>
                  <NavigationMenuLink className="block px-3 py-2 text-sm hover:bg-accent rounded cursor-pointer">
                    Preview
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-sm h-8 px-2 data-[state=open]:bg-transparent hover:bg-transparent [&>svg]:hidden">
                Scene
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-48 p-2">
                  <NavigationMenuLink className="block px-3 py-2 text-sm hover:bg-accent rounded cursor-pointer">
                    Add Scene
                  </NavigationMenuLink>
                  <NavigationMenuLink className="block px-3 py-2 text-sm hover:bg-accent rounded cursor-pointer">
                    Duplicate Scene
                  </NavigationMenuLink>
                  <NavigationMenuLink className="block px-3 py-2 text-sm hover:bg-accent rounded cursor-pointer">
                    Delete Scene
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-sm h-8 px-2 data-[state=open]:bg-transparent hover:bg-transparent [&>svg]:hidden">
                Help
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="w-48 p-2">
                  <NavigationMenuLink className="block px-3 py-2 text-sm hover:bg-accent rounded cursor-pointer">
                    Documentation
                  </NavigationMenuLink>
                  <NavigationMenuLink className="block px-3 py-2 text-sm hover:bg-accent rounded cursor-pointer">
                    Keyboard Shortcuts
                  </NavigationMenuLink>
                  <NavigationMenuLink className="block px-3 py-2 text-sm hover:bg-accent rounded cursor-pointer">
                    About
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
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
