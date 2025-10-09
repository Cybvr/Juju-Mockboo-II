"use client"
import React from "react";
import { Button } from "@/components/ui/button";
import { Home, LayoutTemplate, Film } from "lucide-react";

interface HeaderProps {
  selectedTemplate: any;
  projectConfig: any;
  setIsTemplateModalOpen: (value: boolean) => void;
  setIsModalOpen: (value: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedTemplate,
  projectConfig,
  setIsTemplateModalOpen,
  setIsModalOpen
}) => {
  return (
    <header className="border-b border-border px-6 py-4 bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
            <a href="/dashboard/storymaker">
              <Home className="h-5 w-5" />
            </a>
          </Button>
          <h1 className="text-xl font-semibold">
            {selectedTemplate ? selectedTemplate.name : projectConfig.projectName}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="default" className="bg-background" onClick={() => setIsTemplateModalOpen(true)}>
            <LayoutTemplate className="h-4 w-4 mr-2" /> Template
          </Button>
          <Button variant="default" onClick={() => setIsModalOpen(true)} className="bg-background" >
            <Film className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button variant="default" className="bg-background" >Share</Button>
        </div>
      </div>
    </header>
  );
};
