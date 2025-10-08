"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Sparkles, Upload } from "lucide-react"

type Character = {
  id: number
  name: string
  description: string
  imageUrl?: string
  traits: string[]
}

export function CharacterPage() {
  const [characters, setCharacters] = useState<Character[]>([
    {
      id: 1,
      name: "Isabelle Laurent",
      description:
        "Elegant French brand ambassador in her early 30s with flowing dark hair, sophisticated style, embodies the essence of Lumière Parfum",
      imageUrl: "/elegant-french-woman-with-dark-hair-in-white-dress.jpg",
      traits: ["Elegant", "Sophisticated", "Graceful", "Timeless"],
    },
    {
      id: 2,
      name: "Jean-Claude Moreau",
      description:
        "Distinguished master perfumer in his 50s, silver hair, wearing white lab coat, passionate about fragrance creation",
      imageUrl: "/distinguished-french-perfumer-man-in-white-lab-coa.jpg",
      traits: ["Expert", "Passionate", "Refined", "Artistic"],
    },
    {
      id: 3,
      name: "Sofia Chen",
      description:
        "Modern muse in her mid-20s, minimalist style, represents the contemporary woman who wears Lumière Parfum",
      imageUrl: "/young-asian-woman-in-minimalist-black-outfit-holdi.jpg",
      traits: ["Modern", "Confident", "Minimalist", "Bold"],
    },
  ])

  const addCharacter = () => {
    const newCharacter: Character = {
      id: characters.length + 1,
      name: "",
      description: "",
      traits: [],
    }
    setCharacters([...characters, newCharacter])
  }

  const removeCharacter = (id: number) => {
    setCharacters(characters.filter((char) => char.id !== id))
  }

  const updateCharacter = (id: number, field: keyof Character, value: any) => {
    setCharacters(characters.map((char) => (char.id === id ? { ...char, [field]: value } : char)))
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Character Management</h2>
          <p className="text-muted-foreground">
            Define brand ambassadors, models, and perfumers for your Lumière Parfum videos
          </p>
        </div>
        <Button onClick={addCharacter}>
          <Plus className="h-4 w-4 mr-2" />
          Add Character
        </Button>
      </div>

      <div className="grid gap-6">
        {characters.map((character) => (
          <Card key={character.id} className="p-6">
            <div className="flex gap-6">
              {/* Character Image Upload */}
              <div className="w-48 flex-shrink-0">
                <Label className="text-sm font-medium mb-2 block">Character Image</Label>
                <Card className="border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer overflow-hidden">
                  <div className="aspect-square flex items-center justify-center bg-muted">
                    {character.imageUrl ? (
                      <img
                        src={character.imageUrl || "/placeholder.svg"}
                        alt={character.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Upload Image</span>
                      </div>
                    )}
                  </div>
                </Card>
                <Button variant="outline" size="sm" className="w-full mt-2 gap-2 bg-transparent">
                  <Sparkles className="h-3 w-3" />
                  Generate
                </Button>
              </div>

              {/* Character Details */}
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-4">
                    <div>
                      <Label htmlFor={`name-${character.id}`}>Character Name</Label>
                      <Input
                        id={`name-${character.id}`}
                        value={character.name}
                        onChange={(e) => updateCharacter(character.id, "name", e.target.value)}
                        placeholder="Enter character name"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`description-${character.id}`}>Description</Label>
                      <Textarea
                        id={`description-${character.id}`}
                        value={character.description}
                        onChange={(e) => updateCharacter(character.id, "description", e.target.value)}
                        placeholder="Describe the character's appearance, personality, and role"
                        className="mt-1 min-h-24"
                      />
                    </div>

                    <div>
                      <Label>Character Traits</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {character.traits.map((trait, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                          >
                            {trait}
                          </span>
                        ))}
                        <Button variant="outline" size="sm" className="rounded-full h-7 bg-transparent">
                          <Plus className="h-3 w-3 mr-1" />
                          Add Trait
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCharacter(character.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {characters.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No characters created yet</p>
            <Button onClick={addCharacter}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Character
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}
