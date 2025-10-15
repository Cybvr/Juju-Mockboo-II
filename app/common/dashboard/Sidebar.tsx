"use client";
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  LayoutDashboard,
  Home,
  Drama,
  Clapperboard,
  Image as ImageIcon,
  Video,
  Settings,
  Folder,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { ProfileDropdown } from '@/app/common/dashboard/ProfileDropdown';
import { CreditDisplay } from '@/components/CreditDisplay';
import { CreditService } from '@/lib/credits';

function SimpleCreditDisplay() {
  const [user] = useAuthState(auth);
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      fetchCredits();
    }
  }, [user]);

  const fetchCredits = async () => {
    try {
      const creditData = await CreditService.getUserCredits(user!.uid);
      setCredits(creditData.credits);
    } catch (error) {
      console.error('Failed to fetch credits:', error);
    }
  };

  if (!user || credits === null) return null;

  return (
    <div className="text-xs text-muted-foreground mb-2 px-2">
      💰 {credits.toLocaleString()} credits
    </div>
  );
}

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const [user] = useAuthState(auth);

  const createNewCanvas = async () => {
    if (!user) return;
    try {
      const { documentService } = await import('@/services/documentService');
      const canvasDocument = await documentService.createDocument(user.uid, {
        title: 'New Canvas',
        content: {
          elements: [],
          version: '1.0',
        },
        tags: ['canvas'],
        type: 'canvas' as const,
        isPublic: false,
        starred: false,
        shared: false,
        category: 'UGC' as const,
      });
      window.location.href = `/dashboard/canvas/${canvasDocument}`;
      if (onNavigate) onNavigate();
    } catch (error) {
      console.error('Error creating new canvas:', error);
    }
  };

  const navItems = [
    {
      label: 'New',
      icon: Folder,
      href: '#',
      active: false,
      onClick: createNewCanvas,
    },
    {
      label: 'Videos',
      icon: Clapperboard,
      href: '/dashboard/videos',
      active: pathname.startsWith('/dashboard/videos'),
    },
    {
      label: 'Settings',
      icon: Settings,
      href: '/dashboard/account',
      active: pathname.startsWith('/dashboard/account'),
    },
  ];

  const showLabels = true;

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          'h-full rounded-none transition-all duration-300 relative w-56 bg-card',
          className
        )}
      >
        <div className="p-4 h-full flex flex-col justify-between">
          <div className="text-muted-foreground">
            {/* Logo */}
            <div className="mb-4 flex items-center justify-center">
              <Link href="/dashboard" className="flex">
                <div className="flex items-center justify-center">
                  <Image
                    src="/assets/images/juju/JUJUBLACK.png"
                    alt="Logo"
                    width={64}
                    height={64}
                    className="object-contain dark:hidden"
                  />
                  <Image
                    src="/assets/images/juju/JUJUWHITE.png"
                    alt="Logo"
                    width={64}
                    height={64}
                    className="object-contain hidden dark:block"
                  />
                </div>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="space-y-2 mb-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      {item.label === 'New' ? (
                        <Button
                          onClick={item.onClick}
                          variant="outline"
                          className={cn(
                            'w-full transition-all duration-200 border-dashed',
                            showLabels ? 'justify-start gap-3 h-10' : 'justify-center px-2 h-10'
                          )}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          {showLabels && <span className="truncate">{item.label}</span>}
                        </Button>
                      ) : (
                        <Link href={item.href} onClick={onNavigate}>
                          <Button
                            variant="ghost"
                            className={cn(
                              'w-full transition-all duration-200',
                              showLabels ? 'justify-start gap-3 h-10' : 'justify-center px-2 h-10',
                              item.active && 'text-primary bg-background-50'
                            )}
                          >
                            <Icon className="h-4 w-4 flex-shrink-0" />
                            {showLabels && <span className="truncate">{item.label}</span>}
                          </Button>
                        </Link>
                      )}
                    </TooltipTrigger>
                    {!showLabels && (
                      <TooltipContent side="right" align="center">
                        <p>{item.label}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                );
              })}
            </nav>
          </div>

          {/* Bottom Section - Credits and Profile */}
          <div className="pt-4 border-t text-muted-foreground">
            <SimpleCreditDisplay />
            <div className="flex items-left justify-start">
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}