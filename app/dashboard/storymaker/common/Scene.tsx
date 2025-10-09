"use client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, X, Sparkles, Download, RotateCw, Send, ImageIcon, User, MapPin, Volume2 } from "lucide-react"

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
  const hasVariations = scene.variations.length > 0
  const hasVideos = scene.videos.length > 0
  const selectedCharacter = characters.find(c => c.id === (scene.characterId || scene.character?.id))
  const selectedLocation = locations.find(l => l.id === (scene.locationId || scene.location?.id))
  const selectedSound = sounds.find(s => s.id === (scene.soundId || scene.sound?.id))

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
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
            className="text-gray-400 hover:text-red-500 h-8"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left: Prompt & Images */}
        <div className="col-span-7 space-y-4">
          {/* Prompt Card */}
          <Card className="overflow-hidden border">
            <Textarea
              value={scene.prompt}
              onChange={(e) => onUpdate(scene.id, { prompt: e.target.value })}
              placeholder="Describe your scene..."
              className="min-h-[120px] text-sm resize-none border-none focus-visible:ring-0 p-4"
            />

            {/* Context Pills & Actions */}
            <div className="border-t bg-gray-50/50 p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 overflow-x-auto">
                {/* Character Pill */}
                <Select
                  value={scene.characterId || scene.character?.id || "none"}
                  onValueChange={(value) => onUpdate(scene.id, { characterId: value === "none" ? null : value })}
                >
                  <SelectTrigger className="h-7 w-auto border-none bg-white shadow-sm hover:bg-gray-50">
                    <div className="flex items-center gap-1.5">
                      {selectedCharacter ? (
                        <>
                          <img src={selectedCharacter.imageUrl} alt="" className="w-4 h-4 rounded-full object-cover" />
                          <span className="text-xs">{selectedCharacter.name}</span>
                        </>
                      ) : (
                        <>
                          <User className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-xs text-gray-500">Character</span>
                        </>
                      )}
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No character</SelectItem>
                    {characters.map((character) => (
                      <SelectItem key={character.id} value={character.id}>
                        <div className="flex items-center gap-2">
                          <img src={character.imageUrl} alt={character.name} className="w-5 h-5 rounded-full object-cover" />
                          <span className="text-sm">{character.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Location Pill */}
                <Select
                  value={scene.locationId || scene.location?.id || "none"}
                  onValueChange={(value) => onUpdate(scene.id, { locationId: value === "none" ? null : value })}
                >
                  <SelectTrigger className="h-7 w-auto border-none bg-white shadow-sm hover:bg-gray-50">
                    <div className="flex items-center gap-1.5">
                      {selectedLocation ? (
                        <>
                          <img src={selectedLocation.imageUrl} alt="" className="w-4 h-4 rounded object-cover" />
                          <span className="text-xs">{selectedLocation.name}</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-xs text-gray-500">Location</span>
                        </>
                      )}
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No location</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        <div className="flex items-center gap-2">
                          <img src={location.imageUrl} alt={location.name} className="w-5 h-5 rounded object-cover" />
                          <span className="text-sm">{location.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sound Pill */}
                <Select
                  value={scene.soundId || scene.sound?.id || "none"}
                  onValueChange={(value) => onUpdate(scene.id, { soundId: value === "none" ? null : value })}
                >
                  <SelectTrigger className="h-7 w-auto border-none bg-white shadow-sm hover:bg-gray-50">
                    <div className="flex items-center gap-1.5">
                      {selectedSound ? (
                        <>
                          <Volume2 className="h-3.5 w-3.5" />
                          <span className="text-xs">{selectedSound.name}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-xs text-gray-500">Sound</span>
                        </>
                      )}
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No sound</SelectItem>
                    {sounds.map((sound) => (
                      <SelectItem key={sound.id} value={sound.id}>
                        <span className="text-sm">{sound.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => onRegenerateVariations(scene.id)}
                  title="Regenerate"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  className="h-7 px-3 gap-1.5"
                  onClick={() => onRegenerateVariations(scene.id)}
                >
                  <Send className="h-3.5 w-3.5" />
                  Generate
                </Button>
              </div>
            </div>
          </Card>

          {/* Images Grid */}
          <div className="grid grid-cols-4 gap-3">
            {!hasVariations ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <Card key={idx} className="aspect-square bg-gray-50 border-dashed flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-gray-300" />
                </Card>
              ))
            ) : (
              scene.variations.map((variation, idx) => (
                <Card
                  key={idx}
                  className="aspect-square overflow-hidden relative group cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                  onClick={() => onSelectVariation(scene.id, variation)}
                >
                  <img
                    src={variation}
                    alt={`Variation ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSaveVariation(variation, scene.id, idx)
                    }}
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Right: Videos */}
        <div className="col-span-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-700">Videos</h3>
            <Button
              size="sm"
              onClick={() => onGenerateVideo(scene.id)}
              className="h-7 px-3 gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Create
            </Button>
          </div>

          <div className="space-y-3">
            {!hasVideos ? (
              <Card className="p-4 border-dashed">
                <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                  <p className="text-sm text-gray-400 text-center px-4">
                    Generate a video from your images
                  </p>
                </div>
                <div className="flex items-center gap-2 opacity-50">
                  <Button size="icon" variant="ghost" className="h-6 w-6" disabled>
                    <Play className="h-3 w-3" />
                  </Button>
                  <div className="flex-1 h-1 bg-gray-200 rounded-full" />
                  <span className="text-xs text-gray-400">0:00</span>
                </div>
              </Card>
            ) : (
              scene.videos.map((video) => (
                <Card key={video.id} className="p-3 relative group">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-50 hover:text-red-500"
                    onClick={() => onRemoveVideo(scene.id, video.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>

                  <div className="aspect-video bg-black rounded-lg mb-3 overflow-hidden">
                    {video.url ? (
                      <img src={video.url} alt="Video" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="animate-pulse text-white text-sm">Generating...</div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <Button size="icon" variant="ghost" className="h-6 w-6">
                      <Play className="h-3 w-3" />
                    </Button>
                    <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full w-1/3 bg-primary" />
                    </div>
                    <span className="text-xs text-gray-500">{video.duration}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-7 text-xs"
                      onClick={() => video.url && onSaveVideo(video.url, video.id)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-7 text-xs"
                      onClick={() => onRegenerateVideo(scene.id, video.id)}
                    >
                      <RotateCw className="h-3 w-3 mr-1" />
                      Regenerate
                    </Button>
                  </div>

                  {video.prompt && (
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-2">{video.prompt}</p>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}