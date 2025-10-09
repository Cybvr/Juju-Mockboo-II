"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Sparkles, Upload } from "lucide-react"
import { useStorymaker } from "./storymaker-context"

type Character = {
  id: number
  name: string
  description: string
  imageUrl?: string
  traits: string[]
}

export function CharacterPage() {
  const { selectedTemplate, characters, updateCharacters } = useStorymaker()
  const [localCharacters, setLocalCharacters] = useState<Character[]>([])

  // Update local state when context characters change or template changes
  useEffect(() => {
    if (selectedTemplate) {
      // Extract unique characters from template scenes
      const templateCharacters = selectedTemplate.scenes
        .map((scene, index) => ({
          id: index + 1,
          name: `Character ${index + 1}`,
          description: scene.prompt.substring(0, 100) + "...",
          imageUrl: "/placeholder.svg",
          traits: ["Template Character"],
        }))
        .slice(0, 3); // Limit to 3 characters

      setLocalCharacters(templateCharacters);
      // If there are no characters in context, and we have template characters, update the context
      if (characters.length === 0) {
        updateCharacters(templateCharacters.map(char => ({ ...char, id: String(char.id) })));
      }
    } else {
      // If no template is selected, and context characters are empty, use default characters
      if (characters.length === 0) {
        const defaultCharacters: Character[] = [
          {
            id: 1,
            name: "Isabelle Laurent",
            description: "Lead brand ambassador, elegant and sophisticated",
            imageUrl: "/assets/images/storymaker/elegant-french-woman-with-dark-hair-in-white-dress.jpg",
            traits: ["Elegant", "Sophisticated", "Graceful"],
          },
          {
            id: 2,
            name: "Jean-Claude Moreau",
            description: "Master perfumer with 30 years of experience",
            imageUrl: "/assets/images/storymaker/distinguished-french-perfumer-man-in-white-lab-coa.jpg",
            traits: ["Expert", "Distinguished", "Passionate"],
          },
          {
            id: 3,
            name: "Sofia Chen",
            description: "Modern influencer and brand partner",
            imageUrl: "/assets/images/storymaker/young-asian-woman-in-minimalist-black-outfit-holdi.jpg",
            traits: ["Modern", "Confident", "Stylish"],
          },
        ];
        setLocalCharacters(defaultCharacters);
        updateCharacters(defaultCharacters.map(char => ({ ...char, id: String(char.id) })));
      } else {
        // If context characters exist, use them
        setLocalCharacters(characters.map(char => ({ ...char, id: Number(char.id) })));
      }
    }
  }, [selectedTemplate, characters, updateCharacters]);

  const addCharacter = () => {
    const newCharacter: Character = {
      id: localCharacters.length + 1,
      name: "",
      description: "",
      traits: [],
    };
    const updatedCharacters = [...localCharacters, newCharacter];
    setLocalCharacters(updatedCharacters);
    updateCharacters(updatedCharacters.map(char => ({ ...char, id: String(char.id) })));
  };

  const removeCharacter = (id: number) => {
    const updatedCharacters = localCharacters.filter((char) => char.id !== id);
    setLocalCharacters(updatedCharacters);
    updateCharacters(updatedCharacters.map(char => ({ ...char, id: String(char.id) })));
  };

  const updateCharacter = (id: number, field: keyof Character, value: any) => {
    const updatedCharacters = localCharacters.map((char) =>
      char.id === id ? { ...char, [field]: value } : char
    );
    setLocalCharacters(updatedCharacters);
    updateCharacters(updatedCharacters.map(char => ({ ...char, id: String(char.id) })));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Character Management</h2>
          <p className="text-muted-foreground">
            {selectedTemplate
              ? `Characters for ${selectedTemplate.name} template`
              : "Define brand ambassadors, models, and perfumers for your videos"
            }
          </p>
        </div>
        <Button onClick={addCharacter}>
          <Plus className="h-4 w-4 mr-2" />
          Add Character
        </Button>
      </div>

      <div className="grid gap-6">
        {localCharacters.map((character) => (
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

        {localCharacters.length === 0 && (
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