'use client';
import { Button } from '@/components/ui/button';
import { 
  Clapperboard,
  Home, 
  Palette, 
  Video,
  User
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { cn } from '@/lib/utils';

export function MobileFooter() {
  const pathname = usePathname();
  const [user] = useAuthState(auth);

  // Hide mobile footer on chat routes
  if (pathname.startsWith('/dashboard/chat')) {
    return null;
  }

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
    } catch (error) {
      console.error('Error creating new canvas:', error);
    }
  };

  const navItems = [
    {
      label: 'Home',
      icon: <Home className="h-5 w-5" />,
      href: '/dashboard',
      active: pathname === '/dashboard'
    },
    {
      label: 'Canvas',
      icon: <Palette className="h-5 w-5" />,
      href: '#',
      active: pathname.startsWith('/dashboard/canvas'),
      onClick: createNewCanvas
    },
    {
      label: 'Galleries',
      icon: <Clapperboard className="h-5 w-5" />,
      href: '/dashboard/galleries',
      active: pathname.startsWith('/dashboard/galleries')
    },
    {
      label: 'Videos',
      icon: <Video className="h-5 w-5" />,
      href: '/dashboard/videos',
      active: pathname.startsWith('/dashboard/videos')
    },
    {
      label: 'Profile',
      icon: <User className="h-5 w-5" />,
      href: '/dashboard/profile',
      active: pathname === '/dashboard/profile'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="glass-effect border-t bg-background/95 px-4 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => (
            item.onClick ? (
              <div key={item.label} className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={item.onClick}
                  className={cn(
                    "flex flex-col h-12 w-12 p-1 hover:bg-muted/50",
                    item.active && "text-primary bg-primary/10"
                  )}
                >
                  <div className="flex flex-col items-center space-y-1">
                    {item.icon}
                    <span className="text-[10px] font-medium">{item.label}</span>
                  </div>
                  {item.active && (
                    <div className="absolute top-1 right-1">
                      <div className="h-2 w-2 bg-primary rounded-full"></div>
                    </div>
                  )}
                </Button>
              </div>
            ) : (
              <Link key={item.label} href={item.href} className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "flex flex-col h-12 w-12 p-1 hover:bg-muted/50",
                    item.active && "text-primary bg-primary/10"
                  )}
                >
                  <div className="flex flex-col items-center space-y-1">
                    {item.icon}
                    <span className="text-[10px] font-medium">{item.label}</span>
                  </div>
                  {item.active && (
                    <div className="absolute top-1 right-1">
                      <div className="h-2 w-2 bg-primary rounded-full"></div>
                    </div>
                  )}
                </Button>
              </Link>
            )
          ))}
        </div>
      </div>
    </div>
  );
}