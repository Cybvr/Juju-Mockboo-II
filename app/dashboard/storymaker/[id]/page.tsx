
"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Play, X, Film, Sparkles, Download, RotateCw, Upload, LayoutTemplate, Home } from "lucide-react"
import { CharacterPage } from "../common/character-page"
import { ProjectSetupPage } from "../common/project-setup-page"
import { LocationPage } from "../common/location-page"
import { SoundPage } from "../common/sound-page"
import { FinalVideoModal } from "../common/final-video-modal"
import { ThumbnailSelect } from "@/app/common/storymaker/thumbnail-select"
import { TemplateModal } from "../common/template-modal"
import { templates, type Template } from "@/data/storymakerTemplatesData"
import { StorymakerProvider, useStorymaker } from "../common/storymaker-context"

type LegacyVideo = {
  id: string
  url?: string
  prompt: string
  duration: string
}

type LegacyScene = {
  id: number
  prompt: string
  variations: string[]
  videos: LegacyVideo[]
  characterId?: string
  locationId?: string
  soundId?: string
}

function VideoMaker() {
  const { 
    selectedTemplate, 
    setSelectedTemplate, 
    projectConfig, 
    scenes,
    characters,
    locations,
    sounds,
    updateScenes,
    isLoading 
  } = useStorymaker()
  
  const [activeTab, setActiveTab] = useState("creator")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)

  // Convert Firebase scenes to legacy format for compatibility
  const legacyScenes: LegacyScene[] = scenes.map((scene, idx) => ({
    id: idx + 1,
    prompt: scene.prompt,
    variations: scene.variations?.map(v => v.imageUrl) || [],
    videos: scene.videos?.map(v => ({
      id: v.id,
      url: v.thumbnailUrl,
      prompt: v.prompt,
      duration: v.duration,
    })) || [],
    characterId: scene.character?.id,
    locationId: scene.location?.id,
    soundId: scene.sound?.id,
  }))

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate(template)

    const newScenes = template.scenes.map((scene, idx) => ({
      id: `scene-${idx + 1}`,
      name: `Scene ${idx + 1}`,
      prompt: scene.prompt,
      variations: [],
      videos: [],
      character: undefined,
      location: undefined,
      sound: undefined,
    }))
    updateScenes(newScenes)
  }

  const addScene = () => {
    const newScene = {
      id: `scene-${scenes.length + 1}`,
      name: `Scene ${scenes.length + 1}`,
      prompt: "",
      variations: [],
      videos: [],
      character: undefined,
      location: undefined,
      sound: undefined,
    }
    updateScenes([...scenes, newScene])
  }

  const removeScene = (id: number) => {
    const filteredScenes = scenes.filter((_, idx) => idx + 1 !== id)
    updateScenes(filteredScenes)
  }

  const addVideoToScene = (sceneId: number) => {
    const updatedScenes = scenes.map((scene, idx) => {
      if (idx + 1 === sceneId) {
        return {
          ...scene,
          videos: [
            ...(scene.videos || []),
            {
              id: `v${Date.now()}`,
              videoUrl: "",
              thumbnailUrl: "",
              status: "pending" as const,
              prompt: "New video prompt",
              duration: "0s",
              timestamp: new Date().toISOString(),
            },
          ],
        }
      }
      return scene
    })
    updateScenes(updatedScenes)
  }

  const removeVideoFromScene = (sceneId: number, videoId: string) => {
    const updatedScenes = scenes.map((scene, idx) => {
      if (idx + 1 === sceneId) {
        return {
          ...scene,
          videos: scene.videos?.filter(video => video.id !== videoId) || [],
        }
      }
      return scene
    })
    updateScenes(updatedScenes)
  }

  const updateScene = (sceneId: number, updates: any) => {
    const updatedScenes = scenes.map((scene, idx) => {
      if (idx + 1 === sceneId) {
        const updatedScene = { ...scene }
        
        if (updates.prompt !== undefined) {
          updatedScene.prompt = updates.prompt
        }
        
        if (updates.characterId !== undefined) {
          const character = characters.find(c => c.id === updates.characterId)
          updatedScene.character = character ? {
            id: character.id,
            name: character.name,
            imageUrl: character.imageUrl,
          } : undefined
        }
        
        if (updates.locationId !== undefined) {
          const location = locations.find(l => l.id === updates.locationId)
          updatedScene.location = location ? {
            id: location.id,
            name: location.name,
            imageUrl: location.imageUrl,
          } : undefined
        }
        
        if (updates.soundId !== undefined) {
          const sound = sounds.find(s => s.id === updates.soundId)
          updatedScene.sound = sound ? {
            id: sound.id,
            name: sound.name,
          } : undefined
        }
        
        return updatedScene
      }
      return scene
    })
    updateScenes(updatedScenes)
  }

  const selectVariation = (sceneId: number, variationUrl: string) => {
    const updatedScenes = scenes.map((scene, idx) => {
      if (idx + 1 === sceneId) {
        const updatedVideos = scene.videos && scene.videos.length > 0
          ? scene.videos.map((video, vidIdx) => vidIdx === 0 ? { ...video, thumbnailUrl: variationUrl } : video)
          : [{
              id: `v${Date.now()}`,
              videoUrl: "",
              thumbnailUrl: variationUrl,
              status: "pending" as const,
              prompt: scene.prompt,
              duration: "0:00",
              timestamp: new Date().toISOString(),
            }]
        return { ...scene, videos: updatedVideos }
      }
      return scene
    })
    updateScenes(updatedScenes)
  }

  const generateVideo = (sceneId: number) => {
    const scene = scenes.find((_, idx) => idx + 1 === sceneId)
    if (!scene) return

    const updatedScenes = scenes.map((s, idx) => {
      if (idx + 1 === sceneId) {
        const newVideo = {
          id: `v${Date.now()}`,
          videoUrl: "",
          thumbnailUrl: scene.variations?.[0]?.imageUrl || "/placeholder.svg",
          status: "complete" as const,
          prompt: scene.prompt,
          duration: "0:45",
          timestamp: new Date().toISOString(),
        }
        return { ...s, videos: [...(s.videos || []), newVideo] }
      }
      return s
    })
    updateScenes(updatedScenes)
  }

  const regenerateVariations = (sceneId: number) => {
    console.log("[v0] Regenerating variations for scene", sceneId)
  }

  const saveVariation = (variationUrl: string, sceneId: number, idx: number) => {
    console.log("[v0] Saving variation", variationUrl)
  }

  const saveVideo = (videoUrl: string, videoId: string) => {
    console.log("[v0] Saving video", videoUrl)
  }

  const regenerateVideo = (sceneId: number, videoId: string) => {
    console.log("[v0] Regenerating video", videoId, "for scene", sceneId)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading project...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background ">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
              <a href="/dashboard/storymaker">
                <Home className="h-5 w-5" />
              </a>
            </Button>
            <h1 className="text-xl font-semibold">
              {selectedTemplate ? selectedTemplate.name : projectConfig.projectName}
            </h1>
          </div>
          <div className="flex gap-2">
            <Button variant="default" className="bg-background" onClick={() => setIsTemplateModalOpen(true)}>
              <LayoutTemplate className="h-4 w-4 mr-2" /> Template
            </Button>
            <Button variant="default" onClick={() => setIsModalOpen(true)} className="bg-background" >
              <Film className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button variant="default" className="bg-background" >Share</Button>
          </div>
        </div>
      </header>
       <div className="pt-6 mx-auto max-w-5xl">
      {/* Navigation Tabs */}
      <div className="pt-2">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-transparent border border-border h-auto p-0">
            <TabsTrigger
              value="creator"
              className="rounded-none border-r border-border data-[state=active]:bg-background px-6 py-2"
            >
              Creator
            </TabsTrigger>
            <TabsTrigger
              value="character"
              className="rounded-none border-r border-border data-[state=active]:bg-background px-6 py-2"
            >
              Character
            </TabsTrigger>
            <TabsTrigger
              value="project-setup"
              className="rounded-none border-r border-border data-[state=active]:bg-background px-6 py-2"
            >
              Project Setup
            </TabsTrigger>
            <TabsTrigger
              value="location"
              className="rounded-none border-r border-border data-[state=active]:bg-background px-6 py-2"
            >
              Location
            </TabsTrigger>
            <TabsTrigger value="sound" className="rounded-none data-[state=active]:bg-background px-6 py-2">
              Sound
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {activeTab === "creator" && (
        <div className="max-w-7xl mx-auto py-2 space-y-1">
          {legacyScenes.map((scene, index) => (
            <Card key={scene.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Scene {index + 1}</h2>
                {legacyScenes.length > 1 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeScene(scene.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove Scene
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor={`character-${scene.id}`} className="text-xs font-medium">
                    Character
                  </Label>
                  <ThumbnailSelect
                    options={characters.map(c => ({ id: c.id, name: c.name, imageUrl: c.imageUrl }))}
                    value={scene.characterId}
                    onValueChange={(value) => updateScene(scene.id, { characterId: value })}
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
                    onValueChange={(value) => updateScene(scene.id, { locationId: value })}
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
                    onValueChange={(value) => updateScene(scene.id, { soundId: value })}
                    placeholder="Select sound"
                  />
                </div>
              </div>

              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-2">
                  <Card className="border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer group">
                    <div className="aspect-square flex items-center justify-center bg-muted overflow-hidden relative">
                      <img
                        src="/upload-perfume-commercial-storyboard-sketch.jpg"
                        alt="Upload"
                        className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </div>
                  </Card>
                  <div className="mt-2 space-y-2">
                    <Textarea
                      value={scene.prompt}
                      onChange={(e) => updateScene(scene.id, { prompt: e.target.value })}
                      placeholder="Describe your scene or upload an image..."
                      className="text-xs min-h-20 resize-none"
                    />
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full h-7 text-xs gap-1"
                      onClick={() => regenerateVariations(scene.id)}
                    >
                      Send Prompt
                    </Button>
                  </div>
                </div>

                <div className="col-span-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium">Variations</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => regenerateVariations(scene.id)}
                      className="h-7 text-xs gap-1 bg-transparent"
                    >
                      <Sparkles className="h-3 w-3" />
                      {scene.variations.length > 0 ? "Regen" : "Generate"}
                    </Button>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                    {scene.variations.map((variation, idx) => (
                      <div key={idx} className="flex-shrink-0 w-32 group">
                        <Card
                          className="aspect-square bg-muted overflow-hidden hover:ring-2 hover:ring-primary cursor-pointer transition-all relative"
                          onClick={() => selectVariation(scene.id, variation)}
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
                              saveVariation(variation, scene.id, idx)
                            }}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-span-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium">Videos</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generateVideo(scene.id)}
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
                              removeVideoFromScene(scene.id, video.id)
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
                              onClick={() => video.url && saveVideo(video.url, video.id)}
                            >
                              <Download className="h-3 w-3" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 h-7 text-xs gap-1 bg-transparent"
                              onClick={() => regenerateVideo(scene.id, video.id)}
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
          ))}

          <Button variant="outline" className="w-full max-w-xs bg-transparent" onClick={addScene}>
            Add Scene
          </Button>
        </div>
      )}

      {activeTab === "character" && <CharacterPage />}
      {activeTab === "project-setup" && <ProjectSetupPage />}
      {activeTab === "location" && <LocationPage />}
      {activeTab === "sound" && <SoundPage />}

      <FinalVideoModal open={isModalOpen} onOpenChange={setIsModalOpen} scenes={legacyScenes} />
      <TemplateModal
        open={isTemplateModalOpen}
        onOpenChange={setIsTemplateModalOpen}
        onSelectTemplate={handleSelectTemplate}
      />
        </div> </div>
  )
}

export default function StorymakerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  
  return (
    <StorymakerProvider documentId={id}>
      <VideoMaker />
    </StorymakerProvider>
  )
}
