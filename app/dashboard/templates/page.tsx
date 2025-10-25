"use client";
import React, { useState, useEffect } from "react";
import type { FilmProject } from "@/types/storytypes";
import { getAllStories } from "@/services/storiesService";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Globe, Search, Filter } from "lucide-react";
import { useRouter } from "next/navigation";

const getAllCategories = (templates: FilmProject[]) => {
  const templateCategories = templates
    .map((template) => template.category)
    .filter(Boolean)
    .filter((category, index, self) => self.indexOf(category) === index);
  return ["All", ...templateCategories.sort()];
};

interface TemplateCardProps {
  template: FilmProject;
  onSelect: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect }) => {
  const firstImageUrl = template.storyboard?.[0]?.imageUrl;
  return (
    <Card
      onClick={onSelect}
      className="group cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
    >
      <div className="relative aspect-video bg-muted">
        {firstImageUrl ? (
          <img
            src={firstImageUrl}
            alt="Template thumbnail"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <FileText className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        {/* Video element with fallback to image */}
        {template.storyboard?.[0]?.videoUrl && (
          <video
            src={template.storyboard[0].videoUrl}
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            autoPlay
            muted
            loop
            playsInline
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        {/* Text overlay positioned in bottom right */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white p-2 rounded backdrop-blur-sm">
          <h3 className="font-bold text-sm group-hover:text-primary transition-colors truncate max-w-32">
            {template.title}
          </h3>
        </div>
      </div>
    </Card>
  );
};

export default function TemplatesPage() {
  const [publicTemplates, setPublicTemplates] = useState<FilmProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const router = useRouter();

  useEffect(() => {
    loadPublicTemplates();
  }, []);

  const loadPublicTemplates = async () => {
    setLoading(true);
    try {
      const publicStories = await getAllStories();
      setPublicTemplates(publicStories);
    } catch (error) {
      console.error("Failed to load public templates:", error);
      setPublicTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = publicTemplates.filter((template) => {
    const matchesCategory =
      selectedCategory === "All" || template.category === selectedCategory;
    return matchesCategory;
  });

  const handleSelectTemplate = async (template: FilmProject) => {
    try {
      // Import the duplication service
      const { duplicateStory } = await import("@/services/storiesService");
      const newStory = await duplicateStory(template.id);
      router.push(`/dashboard/stories/${newStory.id}`);
    } catch (error) {
      console.error("Failed to create copy of template:", error);
      // Fallback to direct navigation if duplication fails
      router.push(`/dashboard/stories/${template.id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden mx-auto max-w-6xl">
        <main className="flex-1 overflow-y-auto p-3 lg:p-6">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-foreground">Loading public templates...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden mx-auto max-w-4xl">
      <main className="flex-1 overflow-y-auto p-3 lg:p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-md font-bold">Templates</h1>
          </div>
          {/* Filters */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {getAllCategories(publicTemplates).map((category) => (
                <Badge
                  key={category}
                  variant={
                    selectedCategory === category ? "default" : "outline"
                  }
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
          {/* Templates Grid */}
          {filteredTemplates.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No templates found
                </h3>
                <p className="text-muted-foreground">
                  {selectedCategory !== "All"
                    ? "Try adjusting your filters"
                    : "No public templates are available at the moment"}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={() => handleSelectTemplate(template)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}