"use client"
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Home, LayoutTemplate, Film } from "lucide-react";
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
  const [titleValue, setTitleValue] = useState("");

  const currentTitle = selectedTemplate ? selectedTemplate.name : projectConfig.projectName || "Untitled Story";

  React.useEffect(() => {
    setTitleValue(currentTitle);
  }, [currentTitle]);

  const handleTitleSave = () => {
    if (onTitleChange && titleValue.trim() && titleValue !== currentTitle) {
      onTitleChange(titleValue.trim());
    }
  };

  const handleTitleCancel = () => {
    setTitleValue(currentTitle);
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
          
          <Input
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur()
              if (e.key === "Escape") {
                handleTitleCancel()
                e.currentTarget.blur()
              }
            }}
            className="text-xl font-semibold bg-transparent border-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0 w-auto max-w-[300px] h-8"
          />
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
