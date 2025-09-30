'use client';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { Sidebar } from '@/app/common/dashboard/Sidebar';
import Link from 'next/link';
import Image from 'next/image';
import { CreditDisplay } from '@/components/CreditDisplay';

export function DashboardHeader() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <header className="sticky top-0 w-full z-50 ">
      <div className="container mx-auto px-2 h-12 flex items-center justify-between max-w-7xl">
        {/* Left Side - Mobile Menu */}
        <div className="flex items-center">
          {/* Mobile Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <Sidebar className="border-0 h-full w-full" isMobile onNavigate={() => setIsOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
        {/* Right Side - Credits and Upgrade Link */}
        <div className="flex items-center space-x-4">
          {/* Credit Display - Hidden on mobile */}
          <div className="hidden lg:block">
            <CreditDisplay />
          </div>
          {/* Upgrade Link */}
          <Link href="/pricing">
            <Button variant="outline">Upgrade</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
