"use client"
import React, { useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Sparkles } from 'lucide-react';
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

      toast.success('Gallery created successfully!');
      router.push(`/dashboard/galleries/${galleryId}`);
    } catch (error) {
      console.error('Failed to create gallery:', error);
      toast.error('Failed to create gallery');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6 gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Gallery</h1>
        <p className="text-muted-foreground">
          Set up your gallery and we'll generate your first images automatically
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gallery Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Gallery Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Amazing Collection"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Gallery Type</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a gallery type..." />
              </SelectTrigger>
              <SelectContent>
                {galleryTypes.map(galleryType => (
                  <SelectItem key={galleryType} value={galleryType}>
                    {galleryType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {type === 'Custom' && (
            <div>
              <label className="text-sm font-medium mb-2 block">Custom Type</label>
              <Input
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                placeholder="Enter your custom gallery type..."
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-2 block">
              Creative Prompt
              <span className="text-xs text-muted-foreground ml-2">
                This describes what you want to create
              </span>
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to generate... e.g., 'Modern minimalist product shots with clean white backgrounds'"
              rows={4}
              className="resize-none"
            />
          </div>

          <Button
            onClick={handleCreate}
            className="w-full gap-2"
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Creating Gallery & Generating Images...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Create Gallery & Generate Images
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}