'use client';
import React, { useState } from 'react';
import { LayoutGrid  } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { productsData } from '@/data/productsData';
import Link from 'next/link';

interface ToolsPopoverProps {
  className?: string;
}

export default function ToolsPopover({ className = '' }: ToolsPopoverProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="primary"
          size="sm"
          className={`h-8 px-3 text-sm text-muted-background border-none ${className}`}
        >
          <LayoutGrid  className="h-3 w-3 mr-2" /> Tools
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-4" 
        align="start"
        side="top"
      >
        <div className="mb-3">
          <h3 className="text-sm font-medium">Tools</h3>
          <p className="text-xs text-muted-foreground">Quick access to AI tools</p>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {productsData.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <Link 
                key={tool.id} 
                href={tool.href}
                onClick={() => setOpen(false)}
              >
                <div className="group hover:bg-muted/50 transition-colors rounded-lg p-2 flex flex-col items-center text-center space-y-1">
                  <div className="w-8 h-8 flex items-center justify-center rounded-md">
                    <IconComponent className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-foreground leading-tight">
                    {tool.title}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}