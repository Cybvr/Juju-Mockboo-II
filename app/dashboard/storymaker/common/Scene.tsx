import React from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Play, X, Sparkles, Download, RotateCw, Send } from "lucide-react"
import { ThumbnailSelect } from "@/app/common/storymaker/thumbnail-select"

type Video = {
  id: string
  url?: string
  prompt: string
  duration: string
}

type SceneData = {
  id: number
  prompt: string
  variations: string[]
  videos: Video[]
  characterId?: string
  locationId?: string
  soundId?: string
}

type Character = {
  id: string
  name: string
  imageUrl: string
}

type Location = {
  id: string
  name: string
  imageUrl: string
}

type Sound = {
  id: string
  name: string
}

interface SceneProps {
  scene: SceneData
  index: number
  totalScenes: number
  characters: Character[]
  locations: Location[]
  sounds: Sound[]
  onRemove: (id: number) => void
  onUpdate: (sceneId: number, updates: any) => void
  onSelectVariation: (sceneId: number, variationUrl: string) => void
  onGenerateVideo: (sceneId: number) => void
  onRegenerateVariations: (sceneId: number) => void
  onSaveVariation: (variationUrl: string, sceneId: number, idx: number) => void
  onSaveVideo: (videoUrl: string, videoId: string) => void
  onRegenerateVideo: (sceneId: number, videoId: string) => void
  onRemoveVideo: (sceneId: number, videoId: string) => void
}

export function Scene({
  scene,
  index,
  totalScenes,
  characters,
  locations,
  sounds,
  onRemove,
  onUpdate,
  onSelectVariation,
  onGenerateVideo,
  onRegenerateVariations,
  onSaveVariation,
  onSaveVideo,
  onRegenerateVideo,
  onRemoveVideo,
}: SceneProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Scene {index + 1}</h2>
        {totalScenes > 1 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onRemove(scene.id)}
            className="text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4 mr-1" />
            Remove Scene
          </Button>
        )}
      </div>

      {/* Character, Location, Sound selectors */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
        <div className="space-y-2">
          <Label htmlFor={`character-${scene.id}`} className="text-xs font-medium">
            Character
          </Label>
          <ThumbnailSelect
            options={characters.map(c => ({ id: c.id, name: c.name, imageUrl: c.imageUrl }))}
            value={scene.characterId}
            onValueChange={(value) => onUpdate(scene.id, { characterId: value })}
            placeholder="Select character"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`location-${scene.id}`} className="text-xs font-medium">
            Location
          </Label>
          <ThumbnailSelect
            options={locations.map(l => ({ id: l.id, name: l.name, imageUrl: l.imageUrl }))}
            value={scene.locationId}
            onValueChange={(value) => onUpdate(scene.id, { locationId: value })}
            placeholder="Select location"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`sound-${scene.id}`} className="text-xs font-medium">
            Sound
          </Label>
          <ThumbnailSelect
            options={sounds.map(s => ({ id: s.id, name: s.name }))}
            value={scene.soundId}
            onValueChange={(value) => onUpdate(scene.id, { soundId: value })}
            placeholder="Select sound"
          />
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Upload & Prompt section */}
        <div className="col-span-2">
          <div className="space-y-3">
            <Card className="border-2 border-dashed border-gray-300 hover:border-primary transition-colors cursor-pointer group bg-gray-50">
              <div className="aspect-square flex items-center justify-center">
                <div className="text-gray-400 text-4xl font-light">+</div>
              </div>
            </Card>
            <Card className="p-0 overflow-hidden border-gray-200">
              <Textarea
                value={scene.prompt}
                onChange={(e) => onUpdate(scene.id, { prompt: e.target.value })}
                placeholder="Describe your scene or upload an image..."
                className="border-0 text-sm min-h-[200px] resize-none focus-visible:ring-0 rounded-b-none"
              />
              <div className="border-t border-gray-200 p-3 flex items-center justify-end gap-2 bg-white">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-gray-600 hover:text-gray-900"
                  onClick={() => onRegenerateVariations(scene.id)}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-gray-600 hover:text-gray-900"
                  onClick={() => onRegenerateVariations(scene.id)}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Variations section */}
        <div className="col-span-5">
          <div className="mb-3">
            <h3 className="text-sm font-medium">Images</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 bg-card">
            {scene.variations.map((variation, idx) => (
              <div key={idx} className="group">
                <Card
                  className="aspect-square bg-muted overflow-hidden hover:ring-2 hover:ring-primary cursor-pointer transition-all relative"
                  onClick={() => onSelectVariation(scene.id, variation)}
                >
                  <img
                    src={variation || "/placeholder.svg"}
                    alt={`Variation ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSaveVariation(variation, scene.id, idx)
                    }}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Videos section */}
        <div className="col-span-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Videos</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onGenerateVideo(scene.id)}
              className="h-7 text-xs gap-1"
            >
              <Sparkles className="h-3 w-3" />
              Generate Video
            </Button>
          </div>
          <div className="space-y-3">
            {scene.videos.length === 0 ? (
              <Card className="p-8 border-dashed">
                <div className="text-center text-muted-foreground text-sm">
                  No videos yet. Click "Generate Video" to create one.
                </div>
              </Card>
            ) : (
              scene.videos.map((video) => (
                <Card key={`${scene.id}-${video.id}`} className="p-3 relative group">
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemoveVideo(scene.id, video.id)
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <div className="aspect-video bg-black rounded mb-2 flex items-center justify-center overflow-hidden">
                    {video.url ? (
                      <img
                        src={video.url || "/placeholder.svg"}
                        alt="Video preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-black" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Button size="icon" variant="ghost" className="h-6 w-6 flex-shrink-0">
                      <Play className="h-3 w-3" />
                    </Button>
                    <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-1/3 bg-orange-500" />
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0">{video.duration}</span>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-7 text-xs gap-1 bg-transparent"
                      onClick={() => video.url && onSaveVideo(video.url, video.id)}
                    >
                      <Download className="h-3 w-3" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-7 text-xs gap-1 bg-transparent"
                      onClick={() => onRegenerateVideo(scene.id, video.id)}
                    >
                      <RotateCw className="h-3 w-3" />
                      Regen
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground leading-tight">{video.prompt}</p>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}