"use client"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ChevronUp, ChevronDown, Plus, Sparkles } from "lucide-react"
import { useState, useEffect } from "react"
import { TemplateChooserModal } from "./template-chooser-modal"
import { DocumentPickerModal } from "./document-picker-modal"

interface VideoEditingPanelProps {
  onGenerate: (params: {
    prompt: string;
    first_frame_image?: string;
    last_frame_image?: string;
    duration: number;
    mode: string;
    negative_prompt: string;
  }) => void;
  isGenerating: boolean;
}

export function VideoEditingPanel({ onGenerate, isGenerating }: VideoEditingPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [isDocumentPickerOpen, setIsDocumentPickerOpen] = useState(false)
  const [currentFrameType, setCurrentFrameType] = useState<'first' | 'last'>('first')
  const [promptText, setPromptText] = useState("A beautiful sunset over the mountains with birds flying in the sky")
  const [isDragOverFirst, setIsDragOverFirst] = useState(false)
  const [isDragOverLast, setIsDragOverLast] = useState(false)
  const [firstFrameFile, setFirstFrameFile] = useState<File | null>(null)
  const [lastFrameFile, setLastFrameFile] = useState<File | null>(null)
  const [duration, setDuration] = useState([5])
  const [firstFrameImage, setFirstFrameImage] = useState<string>("")
  const [lastFrameImage, setLastFrameImage] = useState<string>("")
  const [resolution, setResolution] = useState("standard")
  const [negativePrompt, setNegativePrompt] = useState("")

  // Check for stored first frame image on mount
  useEffect(() => {
    const storedFirstFrameImage = sessionStorage.getItem('firstFrameImage');
    if (storedFirstFrameImage) {
      // Set image URL directly for display
      setFirstFrameImage(storedFirstFrameImage);

      // Create mock file object for form consistency
      const mockFile = new File([''], 'imported-first-frame.jpg', { type: 'image/jpeg' });
      setFirstFrameFile(mockFile);

      // Clear after loading
      sessionStorage.removeItem('firstFrameImage');
    }
  }, []);

  const handleDragOver = (e: React.DragEvent, isFirst: boolean) => {
    e.preventDefault()
    if (isFirst) {
      setIsDragOverFirst(true)
    } else {
      setIsDragOverLast(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent, isFirst: boolean) => {
    e.preventDefault()
    if (isFirst) {
      setIsDragOverFirst(false)
    } else {
      setIsDragOverLast(false)
    }
  }

  const handleDrop = (e: React.DragEvent, isFirst: boolean) => {
    e.preventDefault()
    if (isFirst) {
      setIsDragOverFirst(false)
    } else {
      setIsDragOverLast(false)
    }
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'))
    if (files.length > 0) {
      processImageFile(files[0], isFirst)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, isFirst: boolean) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type.startsWith('image/')) {
        processImageFile(file, isFirst)
      }
    }
  }

  const processImageFile = (file: File, isFirst: boolean) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (isFirst) {
        setFirstFrameFile(file)
        setFirstFrameImage(result)
      } else {
        setLastFrameFile(file)
        setLastFrameImage(result)
      }
    }
    reader.readAsDataURL(file)
  }

  const removeFile = (isFirst: boolean) => {
    if (isFirst) {
      setFirstFrameFile(null)
      setFirstFrameImage("")
    } else {
      setLastFrameFile(null)
      setLastFrameImage("")
    }
  }

  const handleGenerate = () => {
    console.log('Generate video clicked:', { 
      promptText, 
      duration: duration[0],
      mode: resolution,
      negativePrompt,
      hasFirstFrame: !!firstFrameImage,
      hasLastFrame: !!lastFrameImage,
      isGenerating 
    });

    const params = {
      prompt: promptText,
      duration: duration[0],
      mode: resolution,
      negative_prompt: negativePrompt,
      ...(firstFrameImage && { first_frame_image: firstFrameImage }),
      ...(lastFrameImage && { last_frame_image: lastFrameImage })
    }

    onGenerate(params)
  }

  const loadTemplateImages = async (firstFrameUrl: string, lastFrameUrl: string, templateTitle: string) => {
    try {
      // Load first frame
      const firstResponse = await fetch(firstFrameUrl);
      const firstBlob = await firstResponse.blob();
      const firstFile = new File([firstBlob], `${templateTitle.toLowerCase().replace(/\s+/g, '-')}-first.jpg`, { type: 'image/jpeg' });
      processImageFile(firstFile, true);

      // Load last frame if different from first
      if (lastFrameUrl !== firstFrameUrl) {
        const lastResponse = await fetch(lastFrameUrl);
        const lastBlob = await lastResponse.blob();
        const lastFile = new File([lastBlob], `${templateTitle.toLowerCase().replace(/\s+/g, '-')}-last.jpg`, { type: 'image/jpeg' });
        processImageFile(lastFile, false);
      }
    } catch (error) {
      console.error('Failed to load template images:', error);
    }
  };

  const handleDocumentImageSelect = async (imageUrl: string, imageName: string) => {
    try {
      // For Firebase Storage URLs, use direct URL assignment to avoid CORS
      console.log('Loading image from:', imageUrl);

      // Create a mock file for form consistency
      const mockFile = new File([''], `${imageName.toLowerCase().replace(/\s+/g, '-')}-${currentFrameType}.jpg`, { type: 'image/jpeg' });

      if (currentFrameType === 'first') {
        setFirstFrameFile(mockFile);
        setFirstFrameImage(imageUrl);
      } else {
        setLastFrameFile(mockFile);
        setLastFrameImage(imageUrl);
      }

      console.log(`Successfully loaded ${currentFrameType} frame image`);
    } catch (error) {
      console.error('Failed to load document image:', error);
      alert('Failed to load image. Please try again or upload a different image.');
    }
  };

  const renderFrameUpload = (isFirst: boolean) => {
    const isDragOver = isFirst ? isDragOverFirst : isDragOverLast
    const uploadedFile = isFirst ? firstFrameFile : lastFrameFile
    const imageUrl = isFirst ? firstFrameImage : lastFrameImage
    const frameType = isFirst ? "first" : "last"
    const inputId = isFirst ? "first-frame-upload" : "last-frame-upload"

    return (
      <div className="flex-1">
        <div 
          className={`border-2 border-dashed rounded-lg p-2  transition-colors cursor-pointer relative ${
            isDragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50 hover:bg-card/80'
          }`}
          onDragOver={(e) => handleDragOver(e, isFirst)}
          onDragLeave={(e) => handleDragLeave(e, isFirst)}
          onDrop={(e) => handleDrop(e, isFirst)}
          onClick={() => document.getElementById(inputId)?.click()}
        >
          <input
            id={inputId}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileSelect(e, isFirst)}
            className="hidden"
          />

          {uploadedFile ? (
            <div className="flex items-center justify-center ">
              <div className="relative group">
                <div className="w-24 h-24 bg-card rounded border overflow-hidden">
                  <img
                    src={imageUrl || URL.createObjectURL(uploadedFile)}
                    alt={`${frameType} frame`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(isFirst)
                  }}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-3">
              <Plus className="w-8 h-8 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm text-foreground font-medium">
                  {isDragOver ? `Drop ${frameType} frame here` : `Add ${frameType} frame`}
                </p>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentFrameType(isFirst ? 'first' : 'last')
                    setIsDocumentPickerOpen(true)
                  }}
                  className="mt-2"
                >
                  Browse
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full lg:w-96 lg:min-w-96 flex flex-col overflow-hidden">
      <div className="lg:hidden border-b border-border p-4 relative z-10">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <h1 className="text-sm font-normal text-muted-foreground">Video Editing</h1>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-foreground" />
          )}
        </button>
      </div>

      <div
        className={`flex-1 overflow-y-auto transition-all duration-300 bg-card/50 relative z-20 ${
          isExpanded ? "max-h-screen" : "max-h-0 lg:max-h-screen"
        }`}
      >
        <div className="p-4 lg:p-6">
          <h1 className="hidden lg:block text-xl font-semibold mb-6 lg:mb-8">Video Editing</h1>

          {/* Frame Uploads - Side by Side */}
          <div className="mb-4 lg:mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderFrameUpload(true)}
              {renderFrameUpload(false)}
            </div>
          </div>

          {/* Prompt Section */}
          <div className="mb-4 lg:mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-normal">Prompt</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTemplateModalOpen(true)}
                className="border-border text-foreground hover:bg-card bg-transparent"
              >
                <Sparkles className="w-4 h-4 mr-1" />
                Templates
              </Button>
            </div>
            <Textarea
              className="bg-card border-border text-foreground resize-none h-20 lg:h-24 mb-2"
              placeholder="Describe the video you want to create (max 2000 characters)"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
            />
          </div>

          {/* Duration Section */}
          <div className="mb-4 lg:mb-6">
            <h2 className="text-sm font-normal mb-3">Duration</h2>
            <div className="space-y-3">
              <Slider
                value={duration}
                onValueChange={setDuration}
                max={10}
                min={5}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5s</span>
                <span className="font-medium">{duration[0]}s</span>
                <span>10s</span>
              </div>
            </div>
          </div>

          {/* Video Settings */}
          <div className="mb-4 lg:mb-6">
            <h2 className="text-sm font-normal mb-3">Video Settings</h2>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Quality Mode</label>
                <Select value={resolution} onValueChange={setResolution}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard (720p, 24fps)</SelectItem>
                    <SelectItem value="pro">Pro (1080p, 24fps)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Negative Prompt Section */}
          <div className="mb-4 lg:mb-6">
            <h2 className="text-sm font-normal mb-2">Negative Prompt (Optional)</h2>
            <Textarea
              className="bg-card border-border text-foreground resize-none h-16"
              placeholder="Things you don't want to see in the video..."
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
            />
          </div>

          {/* Generate Button */}
          <Button 
            className="w-full text-foreground mt-auto" 
            onClick={handleGenerate}
            disabled={isGenerating || !promptText?.trim() || !firstFrameImage}
            data-testid="button-generate-video"
            title={
              isGenerating ? "Generating video..." : 
              !promptText?.trim() ? "Enter a prompt to generate video" :
              !firstFrameImage ? "First frame image is required for Kling" :
              "Generate video"
            }
          >
            {isGenerating ? "Generating Video..." : "Generate Video"}
          </Button>

        </div>
      </div>

      <TemplateChooserModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onTemplateSelect={(template) => {
          setPromptText(template.prompt);

          // Auto-load template images if available
          if (template.firstFrameImage && template.lastFrameImage) {
            loadTemplateImages(template.firstFrameImage, template.lastFrameImage, template.title);
          }

          setIsTemplateModalOpen(false);
        }}
      />

      <DocumentPickerModal
        isOpen={isDocumentPickerOpen}
        onClose={() => setIsDocumentPickerOpen(false)}
        onImageSelect={handleDocumentImageSelect}
        title={`Select ${currentFrameType === 'first' ? 'First' : 'Last'} Frame Image`}
      />
    </div>
  )
}