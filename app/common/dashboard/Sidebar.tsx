
"use client";
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  IoHome,
  IoFilm,
  IoImages,
  IoVideocam,
  IoSettings,
} from 'react-icons/io5';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { ProfileDropdown } from '@/app/common/dashboard/ProfileDropdown';
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

  const navItems = [
    {
      label: 'Home',
      icon: IoHome,
      href: '/dashboard',
      active: pathname === '/dashboard',
    },
    {
      label: 'Videos',
      icon: IoVideocam,
      href: '/dashboard/videos',
      active: pathname.startsWith('/dashboard/videos'),
    },
    {
      label: 'Stories',
      icon: IoFilm,
      href: '/dashboard/stories',
      active: pathname.startsWith('/dashboard/stories'),
    },
    {
      label: 'Galleries',
      icon: IoImages,
      href: '/dashboard/galleries',
      active: pathname.startsWith('/dashboard/galleries'),
    },
    {
      label: 'Settings',
      icon: IoSettings,
      href: '/dashboard/account',
      active: pathname.startsWith('/dashboard/account'),
    },
  ];

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          'h-full rounded-none transition-all duration-300 relative w-16 bg-card',
          className
        )}
      >
        <div className="p-4 h-full flex flex-col items-center">
          {/* Logo */}
          <div className="mb-6 flex items-center justify-center">
            <Link href="/dashboard" className="flex">
              <div className="flex items-center justify-center">
                <Image
                  src="/assets/images/juju/JUJUBLACK.png"
                  alt="Logo"
                  width={48}
                  height={48}
                  className="object-contain dark:hidden"
                />
                <Image
                  src="/assets/images/juju/JUJUWHITE.png"
                  alt="Logo"
                  width={48}
                  height={48}
                  className="object-contain hidden dark:block"
                />
              </div>
            </Link>
          </div>
          {/* Navigation - Centered Vertically */}
          <div className="flex-1 flex items-center justify-center w-full">
            <nav className=" w-full flex flex-col items-center">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Link href={item.href} onClick={onNavigate}>
                        <Button
                          variant="ghost"
                          size="lg"
                          className={cn(
                            'w-14 h-14 p-0 text-muted-foreground hover:text-foreground',
                            item.active && 'text-primary bg-background-50'
                          )}
                        >
                          <Icon className="h-6 w-6" />
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" align="center">
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </nav>
          </div>
          {/* Bottom Section - Credits and Profile */}
          <div className="pt-4 border-t w-full flex flex-col items-center">
            <SimpleCreditDisplay />
            <div className="flex items-center justify-center">
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
