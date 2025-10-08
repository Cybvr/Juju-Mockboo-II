"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { 
  defaultProjectConfig, 
  aspectRatioOptions, 
  resolutionOptions, 
  fpsOptions, 
  aiModelOptions, 
  stylePresetOptions, 
  variationOptions 
} from "@/data/storymakerData"

export function ProjectSetupPage() {
  const [projectName, setProjectName] = useState(defaultProjectConfig.projectName)
  const [projectDescription, setProjectDescription] = useState(defaultProjectConfig.projectDescription)
  const [aspectRatio, setAspectRatio] = useState(defaultProjectConfig.aspectRatio)
  const [duration, setDuration] = useState(defaultProjectConfig.duration)
  const [fps, setFps] = useState(defaultProjectConfig.fps)
  const [resolution, setResolution] = useState(defaultProjectConfig.resolution)
  const [autoTransitions, setAutoTransitions] = useState(defaultProjectConfig.autoTransitions)
  const [backgroundMusic, setBackgroundMusic] = useState(defaultProjectConfig.backgroundMusic)
  const [autoSave, setAutoSave] = useState(defaultProjectConfig.autoSave)
  const [watermark, setWatermark] = useState(defaultProjectConfig.watermark)
  const [aiModel, setAiModel] = useState(defaultProjectConfig.aiModel)
  const [stylePreset, setStylePreset] = useState(defaultProjectConfig.stylePreset)
  const [variations, setVariations] = useState(defaultProjectConfig.variations)

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
          <Button>Save Settings</Button>
        </div>
      </div>
    </div>
  )
}
