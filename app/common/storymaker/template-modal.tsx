"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { templates, type Template } from "@/data/storymakerTemplatesData"
import { Sparkles } from "lucide-react"

interface TemplateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectTemplate: (template: Template) => void
}

export function TemplateModal({ open, onOpenChange, onSelectTemplate }: TemplateModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const categories = [
    { value: "all", label: "All" },
    { value: "ugc-ads", label: "UGC Ads" },
    { value: "entertainment", label: "Entertainment" },
    { value: "food", label: "Food" },
    { value: "montage", label: "Montage" },
    { value: "product-ads", label: "Product Ads" },
    { value: "travel", label: "Travel & Landscapes" },
    { value: "explainer", label: "Explainer" },
    { value: "animated", label: "Animated" },
    { value: "anime", label: "Anime" },
  ]

  const filteredTemplates =
    selectedCategory === "all" ? templates : templates.filter((t) => t.category === selectedCategory)

  const handleSelectTemplate = (template: Template) => {
    onSelectTemplate(template)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Choose a Template
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="w-full justify-start overflow-x-auto flex-shrink-0 bg-muted/50 p-1 rounded-lg">
            {categories.map((category) => (
              <TabsTrigger
                key={category.value}
                value={category.value}
                className="whitespace-nowrap data-[state=active]:bg-background"
              >
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value={selectedCategory} className="mt-0">
              {filteredTemplates.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <div className="text-center">
                    <p className="text-lg mb-2">No templates in this category yet</p>
                    <p className="text-sm">Check back soon for more templates!</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                  {filteredTemplates.map((template) => (
                    <Card
                      key={template.id}
                      className="overflow-hidden hover:ring-2 hover:ring-primary transition-all cursor-pointer group"
                      onClick={() => handleSelectTemplate(template)}
                    >
                      <div className="aspect-video bg-muted overflow-hidden">
                        <img
                          src={template.thumbnailUrl || "/placeholder.svg"}
                          alt={template.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold mb-1 text-balance">{template.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3 text-pretty">{template.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {template.scenes.length} scene{template.scenes.length !== 1 ? "s" : ""}
                          </span>
                          <Button size="sm" variant="outline" className="h-7 text-xs bg-transparent">
                            Use Template
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
