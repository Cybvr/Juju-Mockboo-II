'use client';

import { MobileFooter } from '@/app/common/MobileFooter';
import { Sidebar } from '@/app/common/dashboard/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar className="h-full" />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
      
      {/* Mobile Footer */}
      <MobileFooter />
    </div>
  );
}