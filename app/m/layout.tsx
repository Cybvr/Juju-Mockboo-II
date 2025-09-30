'use client';
import { useState } from 'react';
import { Sidebar } from '@/app/common/dashboard/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const handleToggle = () => {
    setIsSidebarExpanded((prev) => !prev);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          className="h-full"
          isExpanded={isSidebarExpanded}
          onToggle={handleToggle}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
}
