"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"

type Video = {
  id: string
  url?: string
  prompt: string
  duration: string
}

type Scene = {
  id: number
  prompt: string
  variations: string[]
  videos: Video[]
}

type FinalVideoModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  scenes: Scene[]
}

export function FinalVideoModal({ open, onOpenChange, scenes }: FinalVideoModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Final Video Preview</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Main Video Preview */}
          <Card className="p-4">
            <div className="aspect-video bg-black rounded mb-3 flex items-center justify-center">
              <div className="w-full h-full bg-black" />
            </div>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <Play className="h-4 w-4" />
              </Button>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-orange-500" />
              </div>
              <span className="text-sm text-muted-foreground">2m 36s</span>
            </div>
          </Card>

          {/* Scene Timeline */}
          <div>
            <h3 className="text-sm font-medium mb-3">Scene Timeline</h3>
            <div className="grid grid-cols-4 gap-3">
              {scenes.map((scene, index) => (
                <Card key={scene.id} className="p-2 cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="aspect-video bg-muted rounded mb-2 flex items-center justify-center">
                    {scene.videos[0]?.url ? (
                      <img
                        src={scene.videos[0].url || "/placeholder.svg"}
                        alt={`Scene ${index + 1}`}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">Scene {index + 1}</span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium">Scene {index + 1}</p>
                    <p className="text-xs text-muted-foreground">{scene.videos.length} video(s)</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Export Options */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button>Export Video</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
