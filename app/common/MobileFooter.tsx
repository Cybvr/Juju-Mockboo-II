'use client';

import { Button } from '@/components/ui/button';
import { 
  Home, 
  PenTool, 
  Sparkles, 
  User,
  Video
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function MobileFooter() {
  const pathname = usePathname();

  // Hide mobile footer on chat routes
  if (pathname.startsWith('/dashboard/chat')) {
    return null;
  }

  const navItems = [
    {
      label: 'Home',
      icon: <Home className="h-5 w-5" />,
      href: '/dashboard',
      active: pathname === '/dashboard'
    },
    {
      label: 'Images',
      icon: <PenTool className="h-5 w-5" />,
      href: '/dashboard/images/edit',
      active: pathname.startsWith('/dashboard/images/edit')
    },
    {
      label: 'Videos',
      icon: <Video className="h-5 w-5" />,
      href: '/dashboard/videos/edit',
      active: pathname.startsWith('/dashboard/videos/edit')
    },
    {
      label: 'Tools',
      icon: <Sparkles className="h-5 w-5" />,
      href: '/dashboard/tools',
      active: pathname.startsWith('/dashboard/tools')
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
          ))}
        </div>
      </div>
    </div>
  );
}
