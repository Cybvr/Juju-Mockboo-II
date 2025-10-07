'use client';
import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/app/common/dashboard/Header';
import { DocumentGallery } from '@/app/common/dashboard/DocumentGallery';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  return (
    <div className="h-screen flex flex-col relative mx-auto max-w-4xl">
      <div className="lg:hidden">
        <DashboardHeader />
      </div>
      {/* Scrollable content area */}
      <div className="flex-1 overflow-auto pb-32 lg:pb-0">
        <div className="container mx-auto max-w-5xl px-4 py-6">
          {/* Documents Section */}
          <div>
            <DocumentGallery />
          </div>
        </div>
      </div>
    </div>
  );
}
