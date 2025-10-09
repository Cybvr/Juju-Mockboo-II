"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
// Hardcoded options since we moved to Firebase
const aspectRatioOptions = [
  { value: "16:9", label: "16:9 (Landscape)" },
  { value: "9:16", label: "9:16 (Portrait)" },
  { value: "1:1", label: "1:1 (Square)" },
  { value: "4:3", label: "4:3 (Standard)" },
]

const resolutionOptions = [
  { value: "4k", label: "4K (3840x2160)" },
  { value: "1080p", label: "1080p (1920x1080)" },
  { value: "720p", label: "720p (1280x720)" },
  { value: "480p", label: "480p (854x480)" },
]

const fpsOptions = [
  { value: "24", label: "24 FPS (Cinematic)" },
  { value: "30", label: "30 FPS (Standard)" },
  { value: "60", label: "60 FPS (Smooth)" },
]

const aiModelOptions = [
  { value: "standard", label: "Standard Quality" },
  { value: "high", label: "High Quality (Slower)" },
  { value: "ultra", label: "Ultra Quality (Premium)" },
]

const stylePresetOptions = [
  { value: "realistic", label: "Realistic" },
  { value: "animated", label: "Animated" },
  { value: "cinematic", label: "Cinematic" },
  { value: "artistic", label: "Artistic" },
  { value: "documentary", label: "Documentary" },
]

const variationOptions = [
  { value: "2", label: "2 Variations" },
  { value: "4", label: "4 Variations" },
  { value: "6", label: "6 Variations" },
  { value: "8", label: "8 Variations" },
]
import { useStorymaker } from "./storymaker-context"


export function ProjectSetupPage() {
  const { projectConfig: config, updateProjectConfig } = useStorymaker()

  const setConfig = (newConfig: any) => {
    updateProjectConfig(newConfig)
  }

  const [projectName, setProjectName] = useState(config.projectName)
  const [projectDescription, setProjectDescription] = useState(config.projectDescription)
  const [aspectRatio, setAspectRatio] = useState(config.aspectRatio)
  const [duration, setDuration] = useState(config.duration)
  const [fps, setFps] = useState(config.fps)
  const [resolution, setResolution] = useState(config.resolution)
  const [autoTransitions, setAutoTransitions] = useState(config.autoTransitions)
  const [backgroundMusic, setBackgroundMusic] = useState(config.backgroundMusic)
  const [autoSave, setAutoSave] = useState(config.autoSave)
  const [watermark, setWatermark] = useState(config.watermark)
  const [aiModel, setAiModel] = useState(config.aiModel)
  const [stylePreset, setStylePreset] = useState(config.stylePreset)
  const [variations, setVariations] = useState(config.variations)

  // Update local state when config changes (like when template is selected)
  useEffect(() => {
    setProjectName(config.projectName)
    setProjectDescription(config.projectDescription)
    setAspectRatio(config.aspectRatio)
    setDuration(config.duration)
    setFps(config.fps)
    setResolution(config.resolution)
    setAutoTransitions(config.autoTransitions)
    setBackgroundMusic(config.backgroundMusic)
    setAutoSave(config.autoSave)
    setWatermark(config.watermark)
    setAiModel(config.aiModel)
    setStylePreset(config.stylePreset)
    setVariations(config.variations)
  }, [config])

  const handleSaveSettings = () => {
    setConfig({
      projectName,
      projectDescription,
      aspectRatio,
      duration,
      fps,
      resolution,
      autoTransitions,
      backgroundMusic,
      autoSave,
      watermark,
      aiModel,
      stylePreset,
      variations
    })
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Project Setup</h2>
        <p className="text-muted-foreground">Configure your video project settings and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="project-description">Project Description</Label>
              <Textarea
                id="project-description"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Describe your video project"
                className="mt-1 min-h-24"
              />
            </div>
          </div>
        </Card>

        {/* Video Settings */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Video Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
              <Select value={aspectRatio} onValueChange={setAspectRatio}>
                <SelectTrigger id="aspect-ratio" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {aspectRatioOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="resolution">Resolution</Label>
              <Select value={resolution} onValueChange={setResolution}>
                <SelectTrigger id="resolution" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {resolutionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="fps">Frame Rate (FPS)</Label>
              <Select value={fps} onValueChange={setFps}>
                <SelectTrigger id="fps" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fpsOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="duration">Default Scene Duration (seconds)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="60"
                className="mt-1"
              />
            </div>
          </div>
        </Card>

        {/* AI Generation Settings */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">AI Generation Settings</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="ai-model">AI Model</Label>
              <Select value={aiModel} onValueChange={setAiModel}>
                <SelectTrigger id="ai-model" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {aiModelOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="style-preset">Style Preset</Label>
              <Select value={stylePreset} onValueChange={setStylePreset}>
                <SelectTrigger id="style-preset" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stylePresetOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="variations">Number of Variations per Scene</Label>
              <Select value={variations} onValueChange={setVariations}>
                <SelectTrigger id="variations" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {variationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Advanced Options */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Advanced Options</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Transitions</Label>
                <p className="text-sm text-muted-foreground">Automatically add transitions between scenes</p>
              </div>
              <Switch checked={autoTransitions} onCheckedChange={setAutoTransitions} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Background Music</Label>
                <p className="text-sm text-muted-foreground">Add AI-generated background music</p>
              </div>
              <Switch checked={backgroundMusic} onCheckedChange={setBackgroundMusic} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-Save</Label>
                <p className="text-sm text-muted-foreground">Automatically save project changes</p>
              </div>
              <Switch checked={autoSave} onCheckedChange={setAutoSave} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Watermark</Label>
                <p className="text-sm text-muted-foreground">Add watermark to exported videos</p>
              </div>
              <Switch checked={watermark} onCheckedChange={setWatermark} />
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button variant="outline">Reset to Defaults</Button>
          <Button onClick={handleSaveSettings}>Save Settings</Button>
        </div>
      </div>
    </div>
  )
}