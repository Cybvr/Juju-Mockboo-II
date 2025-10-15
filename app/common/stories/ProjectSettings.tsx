import React from 'react';
import type { ProjectSettings as Settings } from '@/types/storytypes';

interface ProjectSettingsProps {
  settings: Settings;
  onUpdate: (newSettings: Settings) => void;
}

export const ProjectSettings: React.FC<ProjectSettingsProps> = ({ settings, onUpdate }) => {
  const handleChange = (field: keyof Settings, value: any) => {
    onUpdate({ ...settings, [field]: value });
  };

  const FormRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center py-4 border-b border-gemini-gray-200 dark:border-gemini-gray-700">
      <label className="font-semibold text-gemini-gray-700 dark:text-gemini-gray-200">{label}</label>
      <div className="md:col-span-2">{children}</div>
    </div>
  );

  const SelectInput: React.FC<{
    value: string | number;
    options: { value: string | number; label: string }[];
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  }> = ({ value, options, onChange }) => (
    <select
      value={value}
      onChange={onChange}
      className="w-full p-2 bg-gemini-gray-100 dark:bg-gemini-gray-700 border border-gemini-gray-300 dark:border-gemini-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );

  const Toggle: React.FC<{ checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ checked, onChange }) => (
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
        <div className="w-11 h-6 bg-gemini-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gemini-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gemini-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gemini-gray-600 peer-checked:bg-blue-600"></div>
    </label>
  );

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto h-full overflow-y-auto">
        <h2 className="text-2xl font-bold text-gemini-gray-900 dark:text-gemini-gray-100 mb-6">Project Settings</h2>
        
        <h3 className="text-lg font-semibold text-gemini-gray-800 dark:text-gemini-gray-200 mt-6 mb-2">Video Settings</h3>
        <FormRow label="Aspect Ratio">
            <SelectInput value={settings.aspectRatio} onChange={e => handleChange('aspectRatio', e.target.value)} options={[{value: '16:9', label: '16:9 (Widescreen)'}, {value: '9:16', label: '9:16 (Vertical)'}, {value: '1:1', label: '1:1 (Square)'}, {value: '4:3', label: '4:3 (Classic)'}]} />
        </FormRow>
        <FormRow label="Resolution">
            <SelectInput value={settings.resolution} onChange={e => handleChange('resolution', e.target.value)} options={[{value: '1080p', label: '1080p (Full HD)'}, {value: '4K', label: '4K (Ultra HD)'}]} />
        </FormRow>
        <FormRow label="Frame Rate (FPS)">
            <SelectInput value={settings.fps} onChange={e => handleChange('fps', parseInt(e.target.value))} options={[{value: 24, label: '24 (Cinematic)'}, {value: 30, label: '30 (Standard)'}, {value: 60, label: '60 (Smooth)'}]} />
        </FormRow>

        <h3 className="text-lg font-semibold text-gemini-gray-800 dark:text-gemini-gray-200 mt-8 mb-2">AI Generation Settings</h3>
         <FormRow label="Style Preset">
            <input type="text" value={settings.stylePreset} onChange={e => handleChange('stylePreset', e.target.value)} className="w-full p-2 bg-gemini-gray-100 dark:bg-gemini-gray-700 border border-gemini-gray-300 dark:border-gemini-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
        </FormRow>

        <h3 className="text-lg font-semibold text-gemini-gray-800 dark:text-gemini-gray-200 mt-8 mb-2">Advanced Options</h3>
        <FormRow label="Auto Transitions">
             <Toggle checked={settings.autoTransitions} onChange={e => handleChange('autoTransitions', e.target.checked)} />
        </FormRow>
        <FormRow label="Background Music">
             <Toggle checked={settings.backgroundMusic} onChange={e => handleChange('backgroundMusic', e.target.checked)} />
        </FormRow>
        <FormRow label="Add Watermark">
            <Toggle checked={settings.watermark} onChange={e => handleChange('watermark', e.target.checked)} />
        </FormRow>
    </div>
  );
};