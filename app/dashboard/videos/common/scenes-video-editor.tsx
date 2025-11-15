// @/app/dashboard/scenes/common/scenes-video-editor.tsx

"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { documentService } from "@/services/documentService"
import { Button } from "@/components/ui/button"
import { ScenesEditingPanel } from "./scenes-editing-panel"
import { ScenesTimeline } from "./scenes-timeline"
import { ScenesPreview } from "./scenes-preview"
import { ScenesHeader } from "./scenes-header"
import { ScenesLeftToolbar } from "./scenes-left-toolbar"
import { VidsToolbar } from "./vids-toolbar"
import { AIImagePanel } from "./AIImagePanel"
import { TextPanel } from "./TextPanel"
import { AudioPanel } from "./AudioPanel" // Assuming AudioPanel is in the same directory
import { Film, Edit3, Clock } from "lucide-react"

export interface Scene {
  id: string
  name: string
  duration: number
  imageUrl?: string
  videoUrl?: string
  type: "image" | "video"
  transition?: string
}

interface ScenesVideoEditorProps {
  projectId?: string
}

export function ScenesVideoEditor({ projectId }: ScenesVideoEditorProps) {
  const { user } = useAuth()
  const [scenes, setScenes] = useState<Scene[]>([])
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [projectTitle, setProjectTitle] = useState("Untitled Project")
  const [isSaving, setIsSaving] = useState(false)
  const [savedProjectTitle, setSavedProjectTitle] = useState("Untitled Project")
  const [projectLoaded, setProjectLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState<"preview" | "edit" | "timeline">("preview")
  const [showEditingPanel, setShowEditingPanel] = useState(false)
  const [showAIImagePanel, setShowAIImagePanel] = useState(false)
  const [showTextPanel, setShowTextPanel] = useState(false)
  const [showAudioPanel, setShowAudioPanel] = useState(false) // State for Audio Panel
  const [showVideosPanel, setShowVideosPanel] = useState(false) // State for Videos Panel

  useEffect(() => {
    const loadProject = async () => {
      if (!user) {
        setProjectLoaded(true)
        return
      }

      if (!projectId) {
        setProjectLoaded(true)
        return
      }

      try {
        const document = await documentService.getDocumentById(projectId)
        if (document && document.userId === user.uid) {
          setProjectTitle(document.title)
          setSavedProjectTitle(document.title)
          if (document.content?.scenes) {
            // Ensure video durations are correctly loaded
            const loadedScenes = document.content.scenes.map((scene: Scene) => {
              if (scene.type === "video" && scene.videoUrl) {
                // Here we would ideally fetch the video duration if not already present
                // For now, we assume the duration stored is correct or a default is applied later
                return { ...scene };
              }
              return scene;
            });
            setScenes(loadedScenes);
          }
        }
      } catch (error) {
        console.error("Failed to load project:", error)
      } finally {
        setProjectLoaded(true)
      }
    }

    loadProject()
  }, [projectId, user])

  useEffect(() => {
    if (!user) return

    const timer = setTimeout(() => {
      if (projectTitle !== savedProjectTitle || scenes.length > 0) {
        saveProject()
      }
    }, 1500)

    return () => clearTimeout(timer)
  }, [projectTitle, savedProjectTitle, scenes, user])

  const saveProject = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      // Generate thumbnail from first scene with media
      let thumbnail = '/placeholder.svg'
      const firstSceneWithMedia = scenes.find(scene => scene.imageUrl || scene.videoUrl)
      console.log('🎬 SCENES SAVE: All scenes:', scenes)
      console.log('🎬 SCENES SAVE: First scene with media:', firstSceneWithMedia)

      if (firstSceneWithMedia) {
        thumbnail = firstSceneWithMedia.imageUrl || firstSceneWithMedia.videoUrl || '/placeholder.svg'
      }

      console.log('🎬 SCENES SAVE: Generated thumbnail:', thumbnail)
      console.log('🎬 SCENES SAVE: Thumbnail is placeholder?', thumbnail === '/placeholder.svg')

      const documentData = {
        title: projectTitle,
        content: {
          scenes: scenes,
          totalDuration: scenes.reduce((sum, scene) => sum + scene.duration, 0),
          status: "editing",
          imageUrls: thumbnail !== '/placeholder.svg' ? [thumbnail] : [],
          videoUrls: [],
        },
        tags: ["scenes", "video-project"],
        type: "scenes" as const,
        isPublic: false,
        starred: false,
        shared: false,
        category: "UGC" as const,
      }

      console.log('🎬 SCENES SAVE: Final document content.imageUrls:', documentData.content.imageUrls)
      console.log('🎬 SCENES SAVE: Complete documentData:', documentData)

      if (projectId) {
        await documentService.updateDocument(projectId, documentData)
      } else {
        const newId = await documentService.createDocument(user.uid, documentData)
        window.history.replaceState(null, "", `/dashboard/scenes/${newId}`)
      }

      setSavedProjectTitle(projectTitle)
    } catch (error) {
      console.error("Failed to save project:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const addScene = (scene: Omit<Scene, "id">) => {
    const newScene: Scene = {
      ...scene,
      id: Date.now().toString(),
    }
    setScenes((prev) => [...prev, newScene])
    setSelectedSceneId(newScene.id)
    console.log('Added scene:', newScene) // Debug log
  }

  const handleAddText = (textType: 'title' | 'subtitle' | 'body') => {
    const canvas = (window as any).sceneCanvas
    if (!canvas) return

    import('fabric').then((FabricModule) => {
      const fontSize = textType === 'title' ? 72 : textType === 'subtitle' ? 48 : 32
      const text = textType === 'title' ? 'Your Title' : textType === 'subtitle' ? 'Your Subtitle' : 'Your Text'

      const textObj = new FabricModule.Text(text, {
        left: 1920 / 2,
        top: 1080 / 2,
        originX: 'center',
        originY: 'center',
        fontSize: fontSize,
        fill: '#ffffff',
        fontFamily: 'Arial',
        fontWeight: textType === 'title' ? 'bold' : 'normal'
      })

      canvas.add(textObj)
      canvas.setActiveObject(textObj)
      canvas.renderAll()
    })
  }

  const updateScene = (sceneId: string, updates: Partial<Scene>) => {
    setScenes((prev) => prev.map((scene) => (scene.id === sceneId ? { ...scene, ...updates } : scene)))
  }

  const removeScene = (sceneId: string) => {
    setScenes((prev) => prev.filter((scene) => scene.id !== sceneId))
    if (selectedSceneId === sceneId) {
      setSelectedSceneId(null)
    }
  }

  const reorderScenes = (fromIndex: number, toIndex: number) => {
    setScenes((prev) => {
      const newScenes = [...prev]
      const [removed] = newScenes.splice(fromIndex, 1)
      newScenes.splice(toIndex, 0, removed)
      return newScenes
    })
  }

  const handleExport = async () => {
    if (!user || scenes.length === 0) {
      setError("Please add at least one scene")
      return
    }

    setIsExporting(true)
    setError(null)

    try {
      // Generate thumbnail from first scene with media
      let thumbnail = '/placeholder.svg'
      const firstSceneWithMedia = scenes.find(scene => scene.imageUrl || scene.videoUrl)
      console.log('🎬 SCENES EXPORT: All scenes:', scenes)
      console.log('🎬 SCENES EXPORT: First scene with media:', firstSceneWithMedia)

      if (firstSceneWithMedia) {
        thumbnail = firstSceneWithMedia.imageUrl || firstSceneWithMedia.videoUrl || '/placeholder.svg'
      }

      console.log('🎬 SCENES EXPORT: Generated thumbnail:', thumbnail)
      console.log('🎬 SCENES EXPORT: Thumbnail is placeholder?', thumbnail === '/placeholder.svg')

      const documentData = {
        title: projectTitle,
        content: {
          scenes: scenes,
          totalDuration: scenes.reduce((sum, scene) => sum + scene.duration, 0),
          status: "generating",
          imageUrls: thumbnail !== '/placeholder.svg' ? [thumbnail] : [],
          videoUrls: [],
        },
        tags: ["scenes", "video-project"],
        type: "scenes" as const,
        isPublic: false,
        starred: false,
        shared: false,
        category: "UGC" as const,
      }

      console.log('🎬 SCENES EXPORT: Final document content.imageUrls:', documentData.content.imageUrls)
      console.log('🎬 SCENES EXPORT: Complete documentData:', documentData)

      const documentId = await documentService.createDocument(user.uid, documentData)

      const response = await fetch("/api/videos/generate-scenes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scenes: scenes,
          documentId: documentId,
        }),
      })

      const data = await response.json()

      if (response.ok && data.data) {
        const videoUrl = data.data.output?.[0]?.url
        if (videoUrl) {
          await documentService.updateDocument(documentId, {
            content: {
              scenes: scenes,
              totalDuration: scenes.reduce((sum, scene) => sum + scene.duration, 0),
              videoUrls: [videoUrl],
              status: "completed",
              generatedAt: new Date().toISOString(),
            },
            type: "video",
          })

          window.location.href = `/m/${documentId}`
        }
      } else {
        throw new Error(data.error || "Video export failed")
      }
    } catch (err) {
      console.error("Generation error:", err)
      setError(err instanceof Error ? err.message : "Failed to export video")
    } finally {
      setIsExporting(false)
    }
  }

  const selectedScene = scenes.find((s) => s.id === selectedSceneId)

  return (
    <div className="h-screen flex flex-col">
      <ScenesHeader
        projectTitle={projectTitle}
        setProjectTitle={setProjectTitle}
        isSaving={isSaving}
        scenesCount={scenes.length}
        totalDuration={scenes.reduce((sum, scene) => sum + scene.duration, 0)}
        isExporting={isExporting}
        onExport={handleExport}
      />

      <div className="md:hidden border-b border-border bg-card/50">
        <div className="flex">
          <button
            onClick={() => setActiveTab("preview")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              activeTab === "preview"
                ? "text-primary border-b-2 border-primary bg-primary/5"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Film className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={() => setActiveTab("edit")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              activeTab === "edit"
                ? "text-primary border-b-2 border-primary bg-primary/5"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Edit3 className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => setActiveTab("timeline")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              activeTab === "timeline"
                ? "text-primary border-b-2 border-primary bg-primary/5"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock className="w-4 h-4" />
            Timeline
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="hidden md:flex flex-1 overflow-hidden">
          {/* Left Toolbar */}
          <ScenesLeftToolbar
              showEditingPanel={showEditingPanel}
              onToggleEditingPanel={() => setShowEditingPanel(!showEditingPanel)}
              showAIImagePanel={showAIImagePanel}
              onToggleAIImagePanel={() => setShowAIImagePanel(!showAIImagePanel)}
              showVideosPanel={showVideosPanel}
              onToggleVideosPanel={() => setShowVideosPanel(!showVideosPanel)}
              showTextPanel={showTextPanel}
              onToggleTextPanel={() => setShowTextPanel(!showTextPanel)}
              showAudioPanel={showAudioPanel}
              onToggleAudioPanel={() => setShowAudioPanel(!showAudioPanel)}
            />

          {/* Editing Panel (conditional) */}
          {showEditingPanel && (
            <div className="w-80 border-r border-border">
              <ScenesEditingPanel onAddScene={addScene} selectedScene={selectedScene} onUpdateScene={updateScene} />
            </div>
          )}

          {/* AI Image Panel (conditional) */}
          {showAIImagePanel && (
          <div className="border-r border-border">
            <AIImagePanel
              onAddToScene={(imageUrl) => { // Renamed videoUrl to imageUrl for consistency
                // Add image to current scene with proper duration
                if (selectedSceneId) {
                  setScenes(prev => prev.map(scene =>
                    scene.id === selectedSceneId
                      ? {
                          ...scene,
                          imageUrl,
                          type: "image" as const,
                          duration: 8 // Default duration, could be made configurable
                        }
                      : scene
                  ))
                }
              }}
            />
          </div>
        )}

          {/* Videos Panel (conditional) */}
          {showVideosPanel && (
            <div className="border-r border-border">
              <AIImagePanel // Duplicating AIImagePanel as requested
                onAddToScene={(videoUrl) => {
                  // Add video to current scene with proper duration
                  if (selectedSceneId) {
                    setScenes(prev => prev.map(scene =>
                      scene.id === selectedSceneId
                        ? {
                            ...scene,
                            videoUrl,
                            imageUrl: videoUrl, // Set imageUrl for timeline thumbnail
                            type: "video" as const,
                            duration: 8 // Set proper duration
                          }
                        : scene
                    ))
                  }
                }}
              />
            </div>
          )}

          {/* Text Panel (conditional) */}
          {showTextPanel && (
            <TextPanel
              isOpen={showTextPanel}
              onClose={() => setShowTextPanel(false)}
              onAddText={handleAddText}
            />
          )}

          {/* Audio Panel (conditional) */}
          {showAudioPanel && (
            <div className="border-r border-border">
              <AudioPanel />
            </div>
          )}

          {/* Center - Preview */}
          <div className="flex-1">
            <ScenesPreview
              scenes={scenes}
              selectedSceneId={selectedSceneId}
              isGenerating={isExporting}
              error={error}
              currentTime={currentTime}
              isPlaying={isPlaying}
              onPlayStateChange={setIsPlaying}
              onTimeUpdate={setCurrentTime}
              onSceneSelect={setSelectedSceneId} // Added for selecting scenes from preview
              onSceneCrop={(sceneId, newDuration) => { // Added for cropping video lengths
                updateScene(sceneId, { duration: newDuration });
              }}
              onUpdateScene={updateScene} // Pass onUpdateScene to preview
            />
          </div>

          {/* Right - Properties */}
          <VidsToolbar
            selectedScene={selectedScene}
            onUpdateScene={updateScene}
          />
        </div>

        <div className="md:hidden flex-1 overflow-hidden">
          {activeTab === "preview" && (
            <ScenesPreview
              scenes={scenes}
              selectedSceneId={selectedSceneId}
              isGenerating={isExporting}
              error={error}
              currentTime={currentTime}
              isPlaying={isPlaying}
              onPlayStateChange={setIsPlaying}
              onTimeUpdate={setCurrentTime}
              onSceneSelect={setSelectedSceneId} // Added for selecting scenes from preview
              onSceneCrop={(sceneId, newDuration) => { // Added for cropping video lengths
                updateScene(sceneId, { duration: newDuration });
              }}
              onUpdateScene={updateScene} // Pass onUpdateScene to preview
            />
          )}

          {activeTab === "edit" && (
            <ScenesEditingPanel onAddScene={addScene} selectedScene={selectedScene} onUpdateScene={updateScene} />
          )}

          {activeTab === "timeline" && (
            <div className="h-full">
              <ScenesTimeline
                scenes={scenes}
                selectedSceneId={selectedSceneId}
                onSelectScene={setSelectedSceneId}
                onUpdateScene={updateScene}
                onRemoveScene={removeScene}
                onReorderScenes={reorderScenes}
                currentTime={currentTime}
                onTimeChange={setCurrentTime}
                isPlaying={isPlaying}
                onPlayStateChange={setIsPlaying}
              />
            </div>
          )}
        </div>
      </div>

      <div className="hidden md:block h-48 border-t border-border">
        <ScenesTimeline
          scenes={scenes}
          selectedSceneId={selectedSceneId}
          onSelectScene={setSelectedSceneId}
          onUpdateScene={updateScene}
          onRemoveScene={removeScene}
          onReorderScenes={reorderScenes}
          currentTime={currentTime}
          onTimeChange={setCurrentTime}
          isPlaying={isPlaying}
          onPlayStateChange={setIsPlaying}
        />
      </div>

      <div className="md:hidden border-t border-border bg-card/50 px-4 py-2">
        <div className="text-xs text-muted-foreground text-center">
          {scenes.length} scenes • {scenes.reduce((sum, scene) => sum + scene.duration, 0).toFixed(1)}s total
        </div>
      </div>
    </div>
  )
}