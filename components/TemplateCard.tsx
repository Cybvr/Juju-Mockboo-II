
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  Download,
  Share,
  Heart,
  Play
} from 'lucide-react';
import { Template } from '@/types/firebase';

interface TemplateCardProps {
  template: Template;
  onUseTemplate?: (templateId: string) => void;
  onLike?: (templateId: string) => void;
  isLiked?: boolean;
  showActions?: boolean;
  compact?: boolean;
}

export function TemplateCard({ 
  template, 
  onUseTemplate, 
  onLike, 
  isLiked = false,
  showActions = true,
  compact = false
}: TemplateCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleUseTemplate = () => {
    if (onUseTemplate) {
      onUseTemplate(template.id);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLike) {
      onLike(template.id);
    }
  };

  return (
    <Card 
      className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 glass-effect"
      onClick={handleUseTemplate}
    >
      <CardContent className="p-0">
        <div className={`${compact ? 'aspect-[4/3]' : 'aspect-square'} relative overflow-hidden rounded-t-lg`}>
          <img 
            src={template.image}
            alt={template.name}
            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          
          {/* Loading placeholder */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <div className="flex space-x-2">
              <Button size="sm" className="bg-primary text-primary-foreground border-0">
                <Play className="mr-2 h-4 w-4" />
                Use Template
              </Button>
            </div>
          </div>
          
          {/* Top badges */}
          <div className="absolute top-3 left-3 flex space-x-2">
            {template.premium && (
              <Badge className="bg-primary text-primary-foreground border-0 text-xs">
                Pro
              </Badge>
            )}
          </div>
          
          {/* Like button */}
          {showActions && onLike && (
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-3 right-3 h-8 w-8 bg-black/20 hover:bg-black/40"
              onClick={handleLike}
            >
              <Heart 
                className={`h-4 w-4 ${
                  isLiked 
                    ? 'fill-red-500 text-red-500' 
                    : 'text-white'
                }`} 
              />
            </Button>
          )}
        </div>
        
        <div className={`${compact ? 'p-3' : 'p-4'}`}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold ${compact ? 'text-sm' : 'text-sm'} truncate`}>
                {template.name}
              </h3>
              <p className="text-xs text-muted-foreground capitalize">
                {template.category}
              </p>
            </div>
            <div className="flex items-center space-x-1 ml-2">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium">{template.rating}</span>
            </div>
          </div>
          
          {!compact && template.description && (
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {template.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {template.uses} uses
            </Badge>
            {showActions && (
              <div className="flex space-x-1">
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                  <Download className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                  <Share className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
