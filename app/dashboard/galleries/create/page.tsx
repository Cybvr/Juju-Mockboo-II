"use client"
import React, { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { galleryService } from '@/services/galleryService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const galleryTypes = [
  'Fashion Collection',
  'Film Storyboards',
  'Interior Views',
  'Product Shots',
  'Architectural Renders',
  'Food Photography',
  'Brand Identity',
  'Custom'
];

export default function CreateGalleryPage() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [customType, setCustomType] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!user) return;
    if (!title.trim()) {
      toast.error('Gallery title is required');
      return;
    }
    if (!prompt.trim()) {
      toast.error('Prompt is required');
      return;
    }
    const galleryType = type === 'Custom' ? customType : type;
    if (!galleryType) {
      toast.error('Gallery type is required');
      return;
    }
    setIsCreating(true);
    try {
      // Create gallery
      const galleryId = await galleryService.createGallery(user.uid, {
        title: title.trim(),
        description: prompt.trim(),
        type: galleryType,
        prompt: prompt.trim(),
        images: [],
        isPublic: false,
        tags: [galleryType.toLowerCase().replace(/\s+/g, '-')]
      });
      router.push(`/dashboard/galleries/${galleryId}`);
    } catch (error) {
      console.error('Failed to create gallery:', error);
      toast.error('Failed to create gallery');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-4 gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Create New Gallery</h1>
      </div>
      <div className="space-y-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter title"
        />
        <Select value={type} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue placeholder="Choose type" />
          </SelectTrigger>
          <SelectContent>
            {galleryTypes.map(galleryType => (
              <SelectItem key={galleryType} value={galleryType}>
                {galleryType}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {type === 'Custom' && (
          <Input
            value={customType}
            onChange={(e) => setCustomType(e.target.value)}
            placeholder="Enter custom type"
          />
        )}
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what you want to generate..."
          rows={3}
          className="resize-none"
        />
        <Button
          onClick={handleCreate}
          className="w-full"
          disabled={isCreating}
        >
          {isCreating ? 'Creating...' : 'Create Gallery'}
        </Button>
      </div>
    </div>
  );
}
