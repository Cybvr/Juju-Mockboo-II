"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, X, Sparkles, Download, RotateCw, Send, ImageIcon } from "lucide-react"

type Video = {
  id: string
  url?: string
  prompt: string
  duration: string
}

type SceneData = {
  id: number
  name?: string
  prompt: string
  variations: string[]
  videos: Video[]
  characterId?: string
  locationId?: string
  soundId?: string
  character?: {
    id: string
    name: string
    imageUrl: string
  }
  location?: {
    id: string
    name: string
    imageUrl: string
  }
  sound?: {
    id: string
    name: string
  }
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
    <div className="p-6 px-6 leading-3">
      <div className="flex items-center justify-between mb-2">
        <Input
          value={scene.name || `Scene ${index + 1}`}
          onChange={(e) => onUpdate(scene.id, { name: e.target.value })}
          className="text-lg font-semibold bg-transparent border-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0 w-auto max-w-[300px] h-8"
        />
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
      <div className="grid grid-cols-3 gap-4 mb-2 p-4 bg-muted/30 rounded-lg px-[0]">
        <div className="space-y-2">
          <Label htmlFor={`character-${scene.id}`} className="text-xs font-medium">
            Character
          </Label>
          <Select
            value={scene.characterId || scene.character?.id || "none"}
            onValueChange={(value) => onUpdate(scene.id, { characterId: value === "none" ? null : value })}
          >
            <SelectTrigger className="w-full h-auto p-2">
              <SelectValue placeholder="Select character" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No character</SelectItem>
              {characters.map((character) => (
                <SelectItem key={character.id} value={character.id}>
                  <div className="flex items-center gap-2">
                    <img
                      src={character.imageUrl || "/placeholder.svg"}
                      alt={character.name}
                      className="w-6 h-6 rounded object-cover flex-shrink-0"
                    />
                    <span className="truncate text-sm">{character.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`location-${scene.id}`} className="text-xs font-medium">
            Location
          </Label>
          <Select
            value={scene.locationId || scene.location?.id || "none"}
            onValueChange={(value) => onUpdate(scene.id, { locationId: value === "none" ? null : value })}
          >
            <SelectTrigger className="w-full h-auto p-2">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No location</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  <div className="flex items-center gap-2">
                    <img
                      src={location.imageUrl || "/placeholder.svg"}
                      alt={location.name}
                      className="w-6 h-6 rounded object-cover flex-shrink-0"
                    />
                    <span className="truncate text-sm">{location.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`sound-${scene.id}`} className="text-xs font-medium">
            Sound
          </Label>
          <Select
            value={scene.soundId || scene.sound?.id || "none"}
            onValueChange={(value) => onUpdate(scene.id, { soundId: value === "none" ? null : value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select sound" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No sound</SelectItem>
              {sounds.map((sound) => (
                <SelectItem key={sound.id} value={sound.id}>
                  <span className="truncate text-sm">{sound.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* Main content grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left section: Upload and Prompt side by side, then Images below */}
        <div className="col-span-7 space-y-6">
          {/* Upload left, Prompt right */}
          <div className="grid grid-cols-12 gap-4">
            {/* Upload section */}
            <div className="col-span-3">
              <Card className="border-2 border-dashed border-gray-300 hover:border-primary transition-colors cursor-pointer group bg-gray-50">
                <div className="aspect-square flex items-center justify-center">
                  <div className="text-gray-400 text-4xl font-light">+</div>
                </div>
              </Card>
            </div>
            {/* Prompt section */}
            <div className="col-span-9">
              <Card className="p-0 overflow-hidden border-gray-200 h-full">
                <Textarea
                  value={scene.prompt}
                  onChange={(e) => onUpdate(scene.id, { prompt: e.target.value })}
                  placeholder="Describe your scene or upload an image..."
                  className="text-sm h-[calc(100%-48px)] resize-none focus-visible:ring-0 rounded-b-none border-none border-0"
                />
                <div className="border-t border-gray-200 p-3 flex items-center justify-end gap-2 bg-white border-none">
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
          {/* Images section below */}
          <div>
            <div className="mb-3">
              <h3 className="text-sm font-medium">Images</h3>
            </div>
            <div className="grid grid-cols-4 gap-3 bg-card">
              {scene.variations.length === 0
                ? // Show 4 placeholders with image icons
                  Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx}>
                      <Card className="aspect-square bg-muted overflow-hidden relative">
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-10 w-10 text-gray-400" />
                        </div>
                      </Card>
                    </div>
                  ))
                : // Show existing variations
                  scene.variations.map((variation, idx) => (
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
        </div>
        {/* Videos section - stays on the right */}
        <div className="col-span-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Videos</h3>
            <Button size="sm" variant="outline" onClick={() => onGenerateVideo(scene.id)} className="h-7 text-xs gap-1">
              <Sparkles className="h-3 w-3" />
              Make
            </Button>
          </div>
          <div className="space-y-3">
            {scene.videos.length === 0 ? (
              <Card className="p-3">
                <div className="aspect-video bg-black rounded mb-2 flex items-center justify-center">
                  <p className="text-white text-sm text-center px-4">
                    No videos yet. Click &quot;Generate Video&quot; to create one.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="icon" variant="ghost" className="h-6 w-6 flex-shrink-0" disabled>
                    <Play className="h-3 w-3" />
                  </Button>
                  <div className="flex-1 h-1 bg-muted rounded-full" />
                  <span className="text-xs text-muted-foreground flex-shrink-0">0:00</span>
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
    </div>
  )
}
