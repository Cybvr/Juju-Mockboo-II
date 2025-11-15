'use client';
import { Button } from '@/components/ui/button';
import { GoHomeFill } from "react-icons/go";
import { PiSlideshowBold } from "react-icons/pi";
import {
  IoFilm,
  IoHome,
  IoBrush,
  IoImages,
  IoVideocam,
  IoPerson
} from 'react-icons/io5';
import { HiOutlineVideoCamera } from "react-icons/hi2";
import { PiPaletteBold } from "react-icons/pi";
import { IoAlbumsOutline } from "react-icons/io5";
import { PiVideoBold } from "react-icons/pi";
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

  const navItems = [
    {
      label: 'Home',
      icon: <GoHomeFill className="h-5 w-5" />,
      href: '/dashboard',
      active: pathname === '/dashboard'
    },
    {
      label: 'Stories',
      icon: <PiSlideshowBold className="h-5 w-5" />,
      href: '/dashboard/stories',
      active: pathname.startsWith('/dashboard/stories')
    },
    {
      label: 'Canvas',
      icon: <PiPaletteBold className="h-5 w-5" />,
      href: '/dashboard/canvas',
      active: pathname.startsWith('/dashboard/canvas')
    },
    {
      label: 'Shorts',
      icon: <HiOutlineVideoCamera className="h-5 w-5" />,
      href: '/dashboard/shorts',
      active: pathname.startsWith('/dashboard/shorts')
    },
    {
      label: 'Profile',
      icon: <IoPerson className="h-5 w-5" />,
      href: '/dashboard/account',
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
