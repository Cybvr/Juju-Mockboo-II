"use client";
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GoHomeFill } from "react-icons/go";
import { PiSlideshowBold } from "react-icons/pi";
import { IoAlbumsOutline } from "react-icons/io5";
import { IoLayersOutline } from "react-icons/io5";
import { HiOutlineVideoCamera } from "react-icons/hi2";
import { PiPaletteBold } from "react-icons/pi";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { ProfileDropdown } from '@/app/common/dashboard/ProfileDropdown';
import { CreditService } from '@/lib/credits';
import { userService } from '@/services/userService';
import { PanelLeftClose, Plus } from 'lucide-react';

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
    <div className="text-sm text-muted-foreground">
      💰 {credits.toLocaleString()}
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
  const [selectedTeam, setSelectedTeam] = useState<string>('personal');
  const [userName, setUserName] = useState<string>('My Team');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setUserName('My Team');
        return;
      }

      try {
        const firestoreUser = await userService.getUserById(user.uid);
        if (firestoreUser) {
          setUserName(firestoreUser.name || user.displayName || user.email?.split('@')[0] || 'My Team');
        } else {
          setUserName(user.displayName || user.email?.split('@')[0] || 'My Team');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserName(user.displayName || user.email?.split('@')[0] || 'My Team');
      }
    };

    fetchUserData();
  }, [user]);

  const navItems = [
    {
      label: 'Stories',
      icon: PiSlideshowBold,
      href: '/dashboard/stories',
      active: pathname.startsWith('/dashboard/stories'),
    },
    {
      label: 'Shorts',
      icon: HiOutlineVideoCamera,
      href: '/dashboard/shorts',
      active: pathname.startsWith('/dashboard/shorts'),
    },
    {
      label: 'Galleries',
      icon: IoAlbumsOutline,
      href: '/dashboard/galleries',
      active: pathname.startsWith('/dashboard/galleries'),
    },
  ];

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          'h-full rounded-none transition-all duration-300 relative bg-card border-r border-border',
          isExpanded ? 'w-56' : 'w-16',
          className
        )}
      >
        <div className="p-2 h-full flex flex-col">
          {/* Header with Logo and Collapse */}
          <div className="mb-3 flex items-center justify-between px-2">
            {isExpanded && (
              <Link href="/dashboard" className="flex">
                <Image
                  src="/assets/images/juju/JUJUWHITE.png"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </Link>
            )}
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onToggle}>
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </div>

          {/* Team Select */}
          {isExpanded && (
            <div className="mb-4 w-full px-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                    <SelectTrigger className="w-full h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">{userName}'s Workspace</SelectItem>
                    </SelectContent>
                  </Select>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Select Team</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}

          {/* Home Button - PLAYGROUND Section */}
          <div className="mb-2 px-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/dashboard" onClick={onNavigate} className="w-full">
                  <Button
                    variant="ghost"
                    className={cn(
                      'w-full h-9 px-2 text-muted-foreground hover:text-foreground',
                      isExpanded ? 'justify-start' : 'justify-center',
                      pathname === '/dashboard' && 'text-primary bg-background-50'
                    )}
                  >
                    <GoHomeFill className={cn('h-4 w-4', isExpanded && 'mr-2')} />
                    {isExpanded && (
                      <span className={cn(
                        'text-sm',
                        pathname === '/dashboard' && 'font-medium'
                      )}>
                        Home
                      </span>
                    )}
                  </Button>
                </Link>
              </TooltipTrigger>
              {!isExpanded && (
                <TooltipContent side="right">
                  <p>Home</p>
                </TooltipContent>
              )}
            </Tooltip>
            {isExpanded && (
              <div className="text-[10px] font-semibold text-muted-foreground/60 mt-3 mb-1 px-2">
                PLAYGROUND
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="w-full flex flex-col space-y-0.5 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link href={item.href} onClick={onNavigate} className="w-full">
                      <Button
                        variant="ghost"
                        className={cn(
                          'w-full h-9 px-2 text-muted-foreground hover:text-foreground',
                          isExpanded ? 'justify-start' : 'justify-center',
                          item.active && 'text-primary bg-background-50'
                        )}
                      >
                        <Icon className={cn('h-4 w-4', isExpanded && 'mr-2')} />
                        {isExpanded && (
                          <span className={cn(
                            'text-sm',
                            item.active && 'font-medium'
                          )}>
                            {item.label}
                          </span>
                        )}
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  {!isExpanded && (
                    <TooltipContent side="right">
                      <p>{item.label}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Bottom Section - Credits and Profile */}
          <div className="pt-2 border-t w-full">
            {isExpanded ? (
              <div className="flex items-center justify-between px-2 gap-2">
                <ProfileDropdown />
                <div className="flex items-center gap-1">
                  <SimpleCreditDisplay />
                  <Link href="/pricing">
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>

              </div>
            ) : (
              <div className="flex items-center justify-center">

              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}