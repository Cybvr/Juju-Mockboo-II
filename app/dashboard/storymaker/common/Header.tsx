"use client"
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Home, LayoutTemplate, Film, Edit2, Check, X } from "lucide-react";
import { ProfileDropdown } from "@/app/common/dashboard/ProfileDropdown";

interface HeaderProps {
  selectedTemplate: any;
  projectConfig: any;
  setIsTemplateModalOpen: (value: boolean) => void;
  setIsModalOpen: (value: boolean) => void;
  onTitleChange?: (newTitle: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedTemplate,
  projectConfig,
  setIsTemplateModalOpen,
  setIsModalOpen,
  onTitleChange
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState("");

  const currentTitle = selectedTemplate ? selectedTemplate.name : projectConfig.projectName || "Untitled Story";

  const handleStartEdit = () => {
    setTempTitle(currentTitle);
    setIsEditingTitle(true);
  };

  const handleSaveTitle = () => {
    if (onTitleChange && tempTitle.trim()) {
      onTitleChange(tempTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleCancelEdit = () => {
    setTempTitle("");
    setIsEditingTitle(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <header className="border-b border-border px-6 py-4 bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
            <a href="/dashboard/storymaker">
              <Home className="h-5 w-5" />
            </a>
          </Button>
          
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <Input
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                className="text-xl font-semibold h-8 min-w-[200px]"
                autoFocus
              />
              <Button variant="ghost" size="sm" onClick={handleSaveTitle}>
                <Check className="h-4 w-4 text-green-600" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                <X className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h1 className="text-xl font-semibold">{currentTitle}</h1>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleStartEdit}
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="default" className="bg-background" onClick={() => setIsTemplateModalOpen(true)}>
            <LayoutTemplate className="h-4 w-4 mr-2" /> Template
          </Button>
          <Button variant="default" onClick={() => setIsModalOpen(true)} className="bg-background" >
            <Film className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button variant="default" className="bg-background" >Share</Button>
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
};
