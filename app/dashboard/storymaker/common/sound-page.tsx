"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Upload, Music, Trash2, Sparkles } from "lucide-react"
import { useStorymaker } from "./storymaker-context"

export function SoundPage() {
  const { sounds, updateSounds, selectedTemplate } = useStorymaker()

  // Update sounds when template changes
  useEffect(() => {
    if (selectedTemplate && sounds.length === 0) {
      // Generate template-specific sounds based on category
      let templateSounds = []

      switch (selectedTemplate.category) {
        case "ugc-ads":
          templateSounds = [
            {
              id: "1",
              name: "Upbeat Background Music",
              type: "music",
              duration: "1:30",
              description: "Energetic music perfect for UGC content",
              tags: ["upbeat", "energetic", "positive"],
            },
            {
              id: "2",
              name: "Natural Ambient Sound",
              type: "ambient",
              duration: "2:00",
              description: "Subtle background ambience for authentic feel",
              tags: ["ambient", "natural", "background"],
            }
          ]
          break
        case "food":
          templateSounds = [
            {
              id: "1",
              name: "Kitchen Sounds",
              type: "sfx",
              duration: "0:30",
              description: "Sizzling, chopping, and cooking sounds",
              tags: ["cooking", "kitchen", "sizzle"],
            },
            {
              id: "2",
              name: "Warm Acoustic Music",
              type: "music",
              duration: "2:00",
              description: "Cozy background music for food content",
              tags: ["acoustic", "warm", "cozy"],
            }
          ]
          break
        case "travel":
          templateSounds = [
            {
              id: "1",
              name: "Adventure Music",
              type: "music",
              duration: "2:30",
              description: "Inspiring music for travel adventures",
              tags: ["adventure", "inspiring", "travel"],
            },
            {
              id: "2",
              name: "Nature Ambience",
              type: "ambient",
              duration: "3:00",
              description: "Natural sounds from beautiful locations",
              tags: ["nature", "outdoor", "peaceful"],
            }
          ]
          break
        case "animated":
          templateSounds = [
            {
              id: "1",
              name: "Motion Graphics Music",
              type: "music",
              duration: "1:00",
              description: "Dynamic music for animated content",
              tags: ["dynamic", "electronic", "modern"],
            },
            {
              id: "2",
              name: "Sound Effects Pack",
              type: "sfx",
              duration: "0:15",
              description: "Various sound effects for animations",
              tags: ["effects", "whoosh", "pop"],
            }
          ]
          break
        default:
          templateSounds = [
            {
              id: "1",
              name: `${selectedTemplate.name} Theme Music`,
              type: "music",
              duration: "2:00",
              description: `Custom music for ${selectedTemplate.name} template`,
              tags: ["theme", "custom", selectedTemplate.category],
            }
          ]
      }

      updateSounds(templateSounds)
    }
    // No default sounds - let Firebase handle the data
  }, [selectedTemplate])

  const addSound = () => {
    const newSound: Sound = {
      id: Date.now().toString(),
      name: "New Sound",
      type: "music",
      duration: "0:00",
      description: "",
      tags: [],
    }
    updateSounds([...sounds, newSound])
  }

  const removeSound = (id: string) => {
    updateSounds(sounds.filter((sound) => sound.id !== id))
  }

  const updateSound = (id: string, updates: Partial<Sound>) => {
    updateSounds(sounds.map((sound) => (sound.id === id ? { ...sound, ...updates } : sound)))
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Sound Library</h2>
          <p className="text-sm text-muted-foreground">
            {selectedTemplate
              ? `Audio for ${selectedTemplate.name} template`
              : "Manage music, ambient sounds, and voiceovers for commercials"
            }
          </p>
        </div>
        <Button onClick={addSound} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Sound
        </Button>
      </div>

      <div className="grid gap-6">
        {sounds.map((sound) => (
          <Card key={sound.id} className="p-6">
            <div className="flex gap-6">
              {/* Upload Area */}
              <div className="flex-shrink-0">
                <Card className="w-32 h-32 border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer">
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-muted/50">
                    {sound.file ? (
                      <Music className="h-8 w-8 text-primary" />
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Upload Audio</span>
                      </>
                    )}
                  </div>
                </Card>
                <Button variant="outline" size="sm" className="w-full mt-2 gap-2 bg-transparent">
                  <Sparkles className="h-3 w-3" />
                  Generate
                </Button>
              </div>

              {/* Sound Details */}
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`sound-name-${sound.id}`}>Sound Name</Label>
                      <Input
                        id={`sound-name-${sound.id}`}
                        value={sound.name}
                        onChange={(e) => updateSound(sound.id, { name: e.target.value })}
                        placeholder="Enter sound name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`sound-type-${sound.id}`}>Type</Label>
                      <Select value={sound.type} onValueChange={(value: any) => updateSound(sound.id, { type: value })}>
                        <SelectTrigger id={`sound-type-${sound.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="music">Music</SelectItem>
                          <SelectItem value="sfx">Sound Effect</SelectItem>
                          <SelectItem value="voiceover">Voiceover</SelectItem>
                          <SelectItem value="ambient">Ambient</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSound(sound.id)}
                    className="text-destructive hover:text-destructive ml-4"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`sound-description-${sound.id}`}>Description</Label>
                  <Textarea
                    id={`sound-description-${sound.id}`}
                    value={sound.description}
                    onChange={(e) => updateSound(sound.id, { description: e.target.value })}
                    placeholder="Describe the sound and when to use it"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`sound-duration-${sound.id}`}>Duration</Label>
                    <Input
                      id={`sound-duration-${sound.id}`}
                      value={sound.duration}
                      onChange={(e) => updateSound(sound.id, { duration: e.target.value })}
                      placeholder="0:00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`sound-tags-${sound.id}`}>Tags</Label>
                    <Input
                      id={`sound-tags-${sound.id}`}
                      value={sound.tags.join(", ")}
                      onChange={(e) =>
                        updateSound(sound.id, {
                          tags: e.target.value.split(",").map((tag) => tag.trim()),
                        })
                      }
                      placeholder="upbeat, energetic, positive"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {sounds.length === 0 && (
        <Card className="p-12 border-dashed">
          <div className="text-center space-y-4">
            <Music className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-medium mb-2">No sounds yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add your first sound to start building your audio library
              </p>
              <Button onClick={addSound} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Sound
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}