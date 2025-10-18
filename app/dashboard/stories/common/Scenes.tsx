import type React from "react"
import { useCallback, useRef, useEffect, useState } from "react"
import type { FilmProject, StoryboardScene } from "@/types/storytypes"
import { Camera, Trash2, Plus, ArrowUp } from "lucide-react"
import { generateSingleImage } from "@/services/filmService"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface ScenesProps {
  project: FilmProject
  onUpdateProject: (updatedProject: FilmProject) => void
}

const SceneCard: React.FC<{
  scene: StoryboardScene
  project: FilmProject
  onUpdateScene: (updatedScene: StoryboardScene) => void
  onDeleteScene: (sceneId: string) => void
}> = ({ scene, project, onUpdateScene, onDeleteScene }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [localPrompt, setLocalPrompt] = useState(scene.prompt || "")
  const [generateOutputs, setGenerateOutputs] = useState(1)

  const adjustHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"
    }
  }, [])

  useEffect(() => {
    setLocalPrompt(scene.prompt || "")
  }, [scene.prompt])

  useEffect(() => {
    adjustHeight()
  }, [localPrompt, adjustHeight])

  const handleGenerateImage = useCallback(async () => {
    const character = project.characters.find((c) => c.id === scene.characterId)
    const location = project.locations.find((l) => l.id === scene.locationId)
    let builtPrompt = scene.prompt || "A cinematic scene."
    if (character) {
      builtPrompt = `${character.name} ${builtPrompt}. Description of ${character.name}: ${character.description}.`
    }
    if (location) {
      builtPrompt = `${builtPrompt} The setting is ${location.name}. Description of location: ${location.description}.`
    }
    if (character?.imageUrl) {
      console.log("Character image available, but not yet used in generation.", character.imageUrl)
    }
    onUpdateScene({ ...scene, generating: true })
    try {
      const images = []
      for (let i = 0; i < generateOutputs; i++) {
        const imageUrl = await generateSingleImage(builtPrompt, project.settings.aspectRatio)
        images.push(imageUrl)
      }
      onUpdateScene({ 
        ...scene, 
        imageUrl: images[0], 
        generatedImages: images,
        generating: false 
      })
    } catch (error) {
      console.error("Image generation failed:", error)
      onUpdateScene({ ...scene, generating: false, imageUrl: "error" })
    }
  }, [scene, project, onUpdateScene, generateOutputs])

  const handleFieldChange = (field: keyof StoryboardScene, value: string | null) => {
    onUpdateScene({ ...scene, [field]: value })
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalPrompt(e.target.value)
    requestAnimationFrame(() => {
      adjustHeight()
    })
  }

  const handleTextareaBlur = () => {
    if (localPrompt !== scene.prompt) {
      handleFieldChange("prompt", localPrompt)
    }
  }

  const handleImageDragStart = (e: React.DragEvent, imageUrl: string) => {
    e.dataTransfer.setData('text/plain', imageUrl)
    e.dataTransfer.setData('application/x-scene-id', scene.id)
  }

  const handleVideoDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    const imageUrl = e.dataTransfer.getData('text/plain')
    const draggedSceneId = e.dataTransfer.getData('application/x-scene-id')
    
    if (imageUrl && draggedSceneId === scene.id) {
      onUpdateScene({ ...scene, videoGenerating: true })
      try {
        // Convert data URL to base64 if needed
        const base64Image = imageUrl.includes('base64,') 
          ? imageUrl.split('base64,')[1] 
          : imageUrl
        
        const response = await fetch('/api/stories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generateVideo',
            prompt: localPrompt || 'A cinematic scene',
            base64Image: base64Image
          })
        })
        
        const data = await response.json()
        if (data.success) {
          onUpdateScene({ ...scene, videoUrl: data.videoUrl, videoGenerating: false })
        } else {
          throw new Error(data.error || 'Video generation failed')
        }
      } catch (error) {
        console.error('Video generation failed:', error)
        onUpdateScene({ ...scene, videoGenerating: false })
      }
    }
  }

  const handleVideoDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex-grow flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <Badge variant="outline" className="text-sm font-semibold">
                Scene {scene.scene_number}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteScene(scene.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <Textarea
                ref={textareaRef}
                value={localPrompt}
                onChange={handleTextareaChange}
                onBlur={handleTextareaBlur}
                placeholder="Action prompt: e.g., 'looks out the window at the rain...'"
                className="flex-grow resize-none min-h-[60px]"
                rows={2}
              />
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col sm:flex-row gap-3 text-left">
                  <Select
                    value={scene.characterId || undefined}
                    onValueChange={(value) => handleFieldChange("characterId", value || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Character" />
                    </SelectTrigger>
                    <SelectContent>
                      {project.characters.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={scene.locationId || undefined}
                    onValueChange={(value) => handleFieldChange("locationId", value || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Location" />
                    </SelectTrigger>
                    <SelectContent>
                      {project.locations.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={scene.soundId || undefined}
                    onValueChange={(value) => handleFieldChange("soundId", value || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Sound" />
                    </SelectTrigger>
                    <SelectContent>
                      {project.sound_design.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.scene_match}: {s.description.substring(0, 20)}...
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Select value={generateOutputs.toString()} onValueChange={(value) => setGenerateOutputs(parseInt(value))}>
                    <SelectTrigger className="w-16 h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleGenerateImage} disabled={scene.generating} size="icon">
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2">
                  <div className="w-full aspect-video bg-muted/50 rounded-lg p-2 border-2 border-dashed border-muted-foreground/20">
                    <div className="grid grid-cols-2 gap-2 w-full h-full">
                      {Array.from({ length: 4 }, (_, index) => {
                        const images = scene.generatedImages || (scene.imageUrl ? [scene.imageUrl] : [])
                        const imageUrl = images[index]
                        
                        return (
                          <div key={index} className="w-full aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                            {scene.generating ? (
                              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            ) : imageUrl === "error" ? (
                              <p className="text-destructive text-xs">Error</p>
                            ) : imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={`Scene ${scene.scene_number} - ${index + 1}`}
                                className="w-full h-full object-cover cursor-grab"
                                draggable
                                onDragStart={(e) => handleImageDragStart(e, imageUrl)}
                              />
                            ) : (
                              <Camera className="w-4 h-4 text-muted-foreground/50" />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-3">
                  <div 
                    className="w-full aspect-video bg-muted/50 rounded-lg overflow-hidden flex items-center justify-center border-2 border-dashed border-muted-foreground/20 relative"
                    onDrop={handleVideoDrop}
                    onDragOver={handleVideoDragOver}
                  >
                    {scene.videoGenerating ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm text-muted-foreground">Generating video...</p>
                      </div>
                    ) : scene.videoUrl ? (
                      <video src={scene.videoUrl} className="w-full h-full object-cover" controls muted loop />
                    ) : (
                      <div className="text-center">
                        <Camera className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Drag image here to generate video</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export const Scenes: React.FC<ScenesProps> = ({ project, onUpdateProject }) => {
  const handleUpdateScene = (updatedScene: StoryboardScene) => {
    const newStoryboard = project.storyboard.map((s) => (s.id === updatedScene.id ? updatedScene : s))
    onUpdateProject({ ...project, storyboard: newStoryboard })
  }
  const handleDeleteScene = (sceneId: string) => {
    const newStoryboard = project.storyboard
      .filter((s) => s.id !== sceneId)
      .map((s, index) => ({ ...s, scene_number: index + 1 }))
    onUpdateProject({ ...project, storyboard: newStoryboard })
  }
  const handleAddScene = () => {
    const newSceneNumber =
      project.storyboard.length > 0 ? Math.max(...project.storyboard.map((s) => s.scene_number)) + 1 : 1
    const newScene: StoryboardScene = {
      id: `scene_${Date.now()}`,
      scene_number: newSceneNumber,
      prompt: "",
      imageUrl: null,
      generating: false,
      videoUrl: null,
      videoGenerating: false,
      characterId: null,
      locationId: null,
      soundId: null,
    }
    onUpdateProject({ ...project, storyboard: [...project.storyboard, newScene] })
  }
  return (
    <div className="h-full flex flex-col">
      <div className="overflow-y-auto pr-2">
        {project.storyboard.length > 0 ? (
          project.storyboard
            .sort((a, b) => a.scene_number - b.scene_number)
            .map((scene) => (
              <SceneCard
                key={scene.id}
                scene={scene}
                project={project}
                onUpdateScene={handleUpdateScene}
                onDeleteScene={handleDeleteScene}
              />
            ))
        ) : (
          <div className="text-center py-20">
            <Camera className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground">Empty Storyboard</h2>
            <p className="text-muted-foreground mt-2">Analyze your script or add a scene to get started.</p>
          </div>
        )}
      </div>
      <div className="flex-shrink-0 pt-4">
        <Button
          onClick={handleAddScene}
          variant="outline"
          className="w-full flex items-center justify-center gap-2 py-3 bg-transparent"
        >
          <Plus className="w-5 h-5" />
          Add Scene
        </Button>
      </div>
    </div>
  )
}