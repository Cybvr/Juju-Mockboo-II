'use client';
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
  Clapperboard,
  Image as ImageIcon,
  Video,
  FolderOpen,
  Globe,
  PanelLeft,
  Folder,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { chatService } from '@/services/chatService';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { ProfileDropdown } from '@/app/common/dashboard/ProfileDropdown';
import { CreditDisplay } from '@/components/CreditDisplay';
import { CreditService } from '@/lib/credits';

interface RecentChat {
  id: string;
  title: string;
  updatedAt: Date;
}

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
  isExpanded?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ className, onNavigate, isExpanded = true, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [user] = useAuthState(auth);
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(false);

  useEffect(() => {
    if (user) {
      loadRecentChats();
    }
  }, [user]);

  const loadRecentChats = async () => {
    if (!user) return;
    setIsLoadingChats(true);
    try {
      const sessions = await chatService.getUserChatSessions(user.uid);
      const chatsWithMessages = sessions
        .map((session) => ({
          id: session.id,
          title: session.title,
          updatedAt: session.updatedAt,
        }))
        .slice(0, 5);
      setRecentChats(chatsWithMessages);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setIsLoadingChats(false);
    }
  };

  const createNewCanvas = async () => {
    if (!user) return;
    try {
      const { documentService } = await import('@/services/documentService');
      const canvasDocument = await documentService.createDocument(user.uid, {
        title: 'New Canvas',
        content: {
          elements: [],
          version: '1.0'
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
      label: 'Images',
      icon: ImageIcon,
      href: '/dashboard/images',
      active: pathname.startsWith('/dashboard/images/edit'),
    },
    {
      label: 'Scenes',
      icon: Clapperboard,
      href: '/dashboard/scenes',
      active: pathname.startsWith('/dashboard/scenes'),
    },
    {
      label: 'Apps',
      icon: LayoutDashboard,
      href: '/dashboard/tools',
      active: pathname.startsWith('/dashboard/tools'),
    },
  ];

  const showLabels = isExpanded;
  const showRecentChats = isExpanded && recentChats.length > 0;

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          'h-full rounded-none transition-all duration-300 relative',
          isExpanded ? 'w-64' : 'w-16',
          className
        )}
      >
        <div className="p-4 h-full flex flex-col justify-between">
          <div className="text-muted-foreground">
            {/* Toggle Button */}
            <div
              className="mb-4 flex items-center justify-center"
            >
              {isExpanded && (
                <Link href="/dashboard" className="flex">
                  <div className="flex items-center justify-center">
                    <Image
                      src="/images/juju.png"
                      alt="Logo"
                      width={64}
                      height={64}
                      className="object-contain"
                    />
                  </div>
                </Link>
              )}
              {onToggle && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onToggle}
                      className="h-8 w-8"
                    >
                      <PanelLeft className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center">
                    <p>{isExpanded ? 'Collapse Sidebar' : 'Expand Sidebar'}</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            {/* New Canvas Button */}
            <div className="space-y-2 mb-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={createNewCanvas}
                    variant="outline"
                    className={cn(
                      'w-full transition-all duration-200 border-dashed',
                      showLabels ? 'justify-start gap-3 h-10' : 'justify-center px-2 h-10'
                    )}
                  >
                    <Folder className="h-4 w-4 flex-shrink-0" />
                    {showLabels && <span className="truncate">New Canvas</span>}
                  </Button>
                </TooltipTrigger>
                {!showLabels && (
                  <TooltipContent side="right" align="center">
                    <p>New Canvas</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </div>

            {/* Navigation */}
            <nav className="space-y-2 mb-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Link href={item.href} onClick={onNavigate}>
                        <Button
                          variant={item.active ? 'default' : 'ghost'}
                          className={cn(
                            'w-full transition-all duration-200',
                            showLabels ? 'justify-start gap-3 h-10' : 'justify-center px-2 h-10',
                            item.active && 'bg-background-50 text-primary-foreground'
                          )}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          {showLabels && <span className="truncate">{item.label}</span>}
                        </Button>
                      </Link>
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

            {/* Recent Chats */}
            {showRecentChats && (
              <div className="overflow-y-auto border-t pt-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Recent Chats</h3>
                {isLoadingChats ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {recentChats.map((chat) => (
                      <Tooltip key={chat.id}>
                        <TooltipTrigger asChild>
                          <Link href={`/dashboard/chat/${chat.id}`} onClick={onNavigate}>
                            <div className="p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors">
                              <div className="text-sm font-medium truncate">{chat.title}</div>
                            </div>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right" align="start">
                          <p className="max-w-xs break-words">{chat.title}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                )}
              </div>
            )}
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