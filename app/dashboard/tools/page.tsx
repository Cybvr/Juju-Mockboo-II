'use client';
import { toolsData } from '@/data/toolsData';
import Link from 'next/link';
import { DashboardHeader } from '@/app/common/dashboard/Header';
import { MobileFooter } from '@/app/common/MobileFooter';

export default function ToolsPage() {
  return (
    <div className="h-screen flex flex-col relative">
      <DashboardHeader />

      {/* Scrollable content area with padding bottom for mobile footer */}
      <div className="flex-1 overflow-auto pb-32 lg:pb-0">
        <div className="container mx-auto max-w-3xl px-4 py-6">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-xl font-normal py-4">
              Tools
            </h1>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {toolsData.map((feature) => (
              <Link key={feature.id} href={feature.href}>
                <div className="group hover:shadow-lg transition-all duration-300 overflow-hidden rounded-lg border bg-card">
                  <div className="flex">
                    <div className="w-16 h-16 lg:w-20 lg:h-20 flex-shrink-0 overflow-hidden rounded-lg m-3">
                      <img
                        src={feature.image}
                        alt={feature.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-lg"
                      />
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-center">
                      <h3 className="text-sm font-medium text-foreground mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Footer - Fixed at bottom on mobile, hidden on desktop */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden z-10">
        <MobileFooter />
      </div>
    </div>
  );
}