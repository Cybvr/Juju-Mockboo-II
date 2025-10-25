
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ProjectSettings as Settings, FilmProject } from '@/types/storytypes';

interface ProjectSettingsProps {
  settings: Settings;
  onUpdate: (newSettings: Settings) => void;
  project?: FilmProject;
  onUpdateProject?: (project: FilmProject) => void;
}

const categories = [
  'UGC',
  'Ad/Commercial', 
  'Film/Cinema',
  'Documentary',
  'Educational',
  'Social Media',
  'Product Demo',
  'Brand Story',
  'Tutorial',
  'Entertainment',
  'Music Video'
];

export const ProjectSettings: React.FC<ProjectSettingsProps> = ({ settings, onUpdate, project, onUpdateProject }) => {
  const handleChange = (field: keyof Settings, value: any) => {
    onUpdate({ ...settings, [field]: value });
  };

  const handleProjectChange = (field: keyof FilmProject, value: any) => {
    if (project && onUpdateProject) {
      onUpdateProject({ ...project, [field]: value });
    }
  };

  const FormRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4 border-b border-border">
      <Label className="font-medium">{label}</Label>
      <div className="md:col-span-2">{children}</div>
    </div>
  );

  return (
    <div className="space-y-6 p-1">
      <div>
        <h2 className="text-2xl font-bold mb-6">Project Settings</h2>
        
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">General Settings</h3>
          
          <FormRow label="Category">
            <Select 
              value={project?.category || ''} 
              onValueChange={(value) => handleProjectChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormRow>
        </div>

        <div className="space-y-1 mt-8">
          <h3 className="text-lg font-semibold">Video Settings</h3>
          
          <FormRow label="Aspect Ratio">
            <Select value={settings.aspectRatio} onValueChange={(value) => handleChange('aspectRatio', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
                <SelectItem value="9:16">9:16 (Vertical)</SelectItem>
                <SelectItem value="1:1">1:1 (Square)</SelectItem>
                <SelectItem value="4:3">4:3 (Classic)</SelectItem>
              </SelectContent>
            </Select>
          </FormRow>
          
          <FormRow label="Resolution">
            <Select value={settings.resolution} onValueChange={(value) => handleChange('resolution', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                <SelectItem value="4K">4K (Ultra HD)</SelectItem>
              </SelectContent>
            </Select>
          </FormRow>
          
          <FormRow label="Frame Rate (FPS)">
            <Select value={settings.fps.toString()} onValueChange={(value) => handleChange('fps', parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24">24 (Cinematic)</SelectItem>
                <SelectItem value="30">30 (Standard)</SelectItem>
                <SelectItem value="60">60 (Smooth)</SelectItem>
              </SelectContent>
            </Select>
          </FormRow>
        </div>

        <div className="space-y-1 mt-8">
          <h3 className="text-lg font-semibold">AI Generation Settings</h3>
          
          <FormRow label="Style Preset">
            <Input 
              value={settings.stylePreset} 
              onChange={(e) => handleChange('stylePreset', e.target.value)} 
              placeholder="Enter style preset..."
            />
          </FormRow>
        </div>

        <div className="space-y-1 mt-8">
          <h3 className="text-lg font-semibold">Advanced Options</h3>
          
          <FormRow label="Auto Transitions">
            <Switch 
              checked={settings.autoTransitions} 
              onCheckedChange={(checked) => handleChange('autoTransitions', checked)} 
            />
          </FormRow>
          
          <FormRow label="Background Music">
            <Switch 
              checked={settings.backgroundMusic} 
              onCheckedChange={(checked) => handleChange('backgroundMusic', checked)} 
            />
          </FormRow>
          
          <FormRow label="Add Watermark">
            <Switch 
              checked={settings.watermark} 
              onCheckedChange={(checked) => handleChange('watermark', checked)} 
            />
          </FormRow>
        </div>
      </div>
    </div>
  );
};
