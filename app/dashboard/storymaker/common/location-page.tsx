"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, MapPin, Sparkles, Upload } from "lucide-react"
import { useStorymaker } from "./storymaker-context"

type Location = {
  id: string
  name: string
  description: string
  type: string
  timeOfDay: string
  weather: string
  imageUrl?: string
}

export function LocationPage() {
  const { locations, updateLocations, selectedTemplate } = useStorymaker()

  const addLocation = () => {
    const newLocation: Location = {
      id: crypto.randomUUID(),
      name: "",
      description: "",
      type: "outdoor",
      timeOfDay: "day",
      weather: "clear",
    }
    updateLocations([...locations, newLocation])
  }

  const removeLocation = (id: string) => {
    updateLocations(locations.filter((loc) => loc.id !== id))
  }

  const updateLocation = (id: string, field: keyof Location, value: any) => {
    updateLocations(locations.map((loc) => (loc.id === id ? { ...loc, [field]: value } : loc)))
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Location Management</h2>
          <p className="text-muted-foreground">
            {selectedTemplate
              ? `Locations for ${selectedTemplate.name} template`
              : "Define filming locations for your commercial scenes"
            }
          </p>
        </div>
        <Button onClick={addLocation}>
          <Plus className="h-4 w-4 mr-2" />
          Add Location
        </Button>
      </div>

      <div className="grid gap-6">
        {locations.map((location) => (
          <Card key={location.id} className="p-6">
            <div className="flex gap-6">
              {/* Location Image Upload */}
              <div className="w-64 flex-shrink-0">
                <Label className="text-sm font-medium mb-2 block">Location Image</Label>
                <Card className="border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer overflow-hidden">
                  <div className="aspect-video flex items-center justify-center bg-muted">
                    {location.imageUrl ? (
                      <img
                        src={location.imageUrl || "/placeholder.svg"}
                        alt={location.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Upload Location Image</span>
                      </div>
                    )}
                  </div>
                </Card>
                <Button variant="outline" size="sm" className="w-full mt-2 gap-2 bg-transparent">
                  <Sparkles className="h-3 w-3" />
                  Generate
                </Button>
              </div>

              {/* Location Details */}
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-4">
                    <div>
                      <Label htmlFor={`location-name-${location.id}`}>Location Name</Label>
                      <Input
                        id={`location-name-${location.id}`}
                        value={location.name}
                        onChange={(e) => updateLocation(location.id, "name", e.target.value)}
                        placeholder="Enter location name"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`location-description-${location.id}`}>Description</Label>
                      <Textarea
                        id={`location-description-${location.id}`}
                        value={location.description}
                        onChange={(e) => updateLocation(location.id, "description", e.target.value)}
                        placeholder="Describe the location's appearance, atmosphere, and key features"
                        className="mt-1 min-h-20"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor={`location-type-${location.id}`}>Location Type</Label>
                        <Select
                          value={location.type}
                          onValueChange={(value) => updateLocation(location.id, "type", value)}
                        >
                          <SelectTrigger id={`location-type-${location.id}`} className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="outdoor">Outdoor</SelectItem>
                            <SelectItem value="indoor">Indoor</SelectItem>
                            <SelectItem value="urban">Urban</SelectItem>
                            <SelectItem value="nature">Nature</SelectItem>
                            <SelectItem value="fantasy">Fantasy</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor={`time-of-day-${location.id}`}>Time of Day</Label>
                        <Select
                          value={location.timeOfDay}
                          onValueChange={(value) => updateLocation(location.id, "timeOfDay", value)}
                        >
                          <SelectTrigger id={`time-of-day-${location.id}`} className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dawn">Dawn</SelectItem>
                            <SelectItem value="morning">Morning</SelectItem>
                            <SelectItem value="afternoon">Afternoon</SelectItem>
                            <SelectItem value="evening">Evening</SelectItem>
                            <SelectItem value="night">Night</SelectItem>
                            <SelectItem value="golden hour">Golden Hour</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor={`weather-${location.id}`}>Weather</Label>
                        <Select
                          value={location.weather}
                          onValueChange={(value) => updateLocation(location.id, "weather", value)}
                        >
                          <SelectTrigger id={`weather-${location.id}`} className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sunny">Sunny</SelectItem>
                            <SelectItem value="clear">Clear</SelectItem>
                            <SelectItem value="cloudy">Cloudy</SelectItem>
                            <SelectItem value="rainy">Rainy</SelectItem>
                            <SelectItem value="stormy">Stormy</SelectItem>
                            <SelectItem value="foggy">Foggy</SelectItem>
                            <SelectItem value="snowy">Snowy</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLocation(location.id)}
                    className="text-destructive hover:text-destructive ml-4"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {locations.length === 0 && (
          <Card className="p-12 text-center">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No locations created yet</p>
            <Button onClick={addLocation}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Location
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}