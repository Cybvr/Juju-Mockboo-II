
"use client"
import React, { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus } from "lucide-react"
import { CharacterPage } from "../common/character-page"
import { ProjectSetupPage } from "../common/project-setup-page"
import { LocationPage } from "../common/location-page"
import { SoundPage } from "../common/sound-page"
import { FinalVideoModal } from "../common/final-video-modal"
import { TemplateModal } from "../common/template-modal"
import { templates, type Template } from "@/data/storymakerTemplatesData"
import { StorymakerProvider, useStorymaker } from "../common/storymaker-context"
import { Header } from "../common/Header"
import { Scene } from "../common/Scene"

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
  const { storyData, updateStoryData, isLoading, saveError } = useStorymaker()

  const [activeTab, setActiveTab] = useState("creator")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)

  // Memoize legacy conversion to avoid recalculating on every render
  const legacyScenes: LegacyScene[] = useMemo(() => 
    (storyData?.scenes || []).map((scene, idx) => ({
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
    })), [storyData?.scenes]
  )

  // Helper function to update scenes
  const updateSceneByIndex = useCallback((index: number, updater: (scene: any) => any) => {
    const updatedScenes = (storyData?.scenes || []).map((scene, idx) => 
      idx === index ? updater(scene) : scene
    )
    updateStoryData({ scenes: updatedScenes })
  }, [storyData?.scenes, updateStoryData])

  const handleSelectTemplate = (template: Template) => {
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
    
    updateStoryData({
      selectedTemplate: template,
      scenes: newScenes,
      projectConfig: {
        ...storyData?.projectConfig || {},
        projectName: template.name,
        projectDescription: template.description
      }
    })
  }

  const addScene = () => {
    const currentScenes = storyData?.scenes || []
    const newScene = {
      id: `scene-${currentScenes.length + 1}`,
      name: `Scene ${currentScenes.length + 1}`,
      prompt: "",
      variations: [],
      videos: [],
      character: undefined,
      location: undefined,
      sound: undefined,
    }
    updateStoryData({ scenes: [...currentScenes, newScene] })
  }

  const removeScene = (id: number) => {
    const filteredScenes = (storyData?.scenes || []).filter((_, idx) => idx + 1 !== id)
    updateStoryData({ scenes: filteredScenes })
  }

  const removeVideoFromScene = (sceneId: number, videoId: string) => {
    const updatedScenes = (storyData?.scenes || []).map((scene, idx) => {
      if (idx + 1 === sceneId) {
        return {
          ...scene,
          videos: scene.videos?.filter(video => video.id !== videoId) || [],
        }
      }
      return scene
    })
    updateStoryData({ scenes: updatedScenes })
  }

  const updateScene = useCallback((sceneId: number, updates: any) => {
    updateSceneByIndex(sceneId - 1, (scene: any) => {
      const updatedScene = { ...scene }

      if (updates.prompt !== undefined) {
        updatedScene.prompt = updates.prompt
      }

      if (updates.characterId !== undefined) {
        const character = storyData?.characters?.find(c => c.id === updates.characterId)
        updatedScene.character = character ? {
          id: character.id,
          name: character.name,
          imageUrl: character.imageUrl,
        } : undefined
      }

      if (updates.locationId !== undefined) {
        const location = storyData?.locations?.find(l => l.id === updates.locationId)
        updatedScene.location = location ? {
          id: location.id,
          name: location.name,
          imageUrl: location.imageUrl,
        } : undefined
      }

      if (updates.soundId !== undefined) {
        const sound = storyData?.sounds?.find(s => s.id === updates.soundId)
        updatedScene.sound = sound ? {
          id: sound.id,
          name: sound.name,
        } : undefined
      }

      return updatedScene
    })
  }, [updateSceneByIndex, storyData?.characters, storyData?.locations, storyData?.sounds])

  const selectVariation = useCallback((sceneId: number, variationUrl: string) => {
    updateSceneByIndex(sceneId - 1, (scene: any) => {
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
    })
  }, [updateSceneByIndex])

  const generateVideo = useCallback((sceneId: number) => {
    const scene = (storyData?.scenes || []).find((_, idx) => idx + 1 === sceneId)
    if (!scene) return
    
    updateSceneByIndex(sceneId - 1, (scene: any) => {
      const newVideo = {
        id: `v${Date.now()}`,
        videoUrl: "",
        thumbnailUrl: scene.variations?.[0]?.imageUrl || "/placeholder.svg",
        status: "complete" as const,
        prompt: scene.prompt,
        duration: "0:45",
        timestamp: new Date().toISOString(),
      }
      return { ...scene, videos: [...(scene.videos || []), newVideo] }
    })
  }, [updateSceneByIndex, storyData?.scenes])

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
      <Header
        setIsTemplateModalOpen={setIsTemplateModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
      {saveError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 mx-auto max-w-5xl">
          <p className="text-sm font-medium">⚠️ {saveError}</p>
        </div>
      )}
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
          <div className="max-w-7xl mx-auto py-2 space-y-4">
            {legacyScenes.map((scene, index) => (
              <Scene
                key={scene.id}
                scene={scene}
                index={index}
                totalScenes={legacyScenes.length}
                characters={storyData?.characters || []}
                locations={storyData?.locations || []}
                sounds={storyData?.sounds || []}
                onRemove={removeScene}
                onUpdate={updateScene}
                onSelectVariation={selectVariation}
                onGenerateVideo={generateVideo}
                onRegenerateVariations={regenerateVariations}
                onSaveVariation={saveVariation}
                onSaveVideo={saveVideo}
                onRegenerateVideo={regenerateVideo}
                onRemoveVideo={removeVideoFromScene}
              />
            ))}

            <div className="flex justify-center py-4">
              <Button 
                variant="outline" 
                className="gap-2" 
                onClick={addScene}
              >
                <Plus className="h-4 w-4" />
                Add Scene
              </Button>
            </div>
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
      </div>
    </div>
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
