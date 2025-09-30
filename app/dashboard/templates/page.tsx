
'use client';

import { TemplatesGallery } from '@/components/TemplatesGallery';
import { DashboardHeader } from '@/app/common/dashboard/Header';
import { useRouter } from 'next/navigation';

export default function Templates() {
  const router = useRouter();

  const handleTemplateSelect = (templateId: string) => {
    router.push(`/dashboard/create?template=${templateId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <div className="pt-16">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Template Library</h1>
            <p className="text-muted-foreground">
              Browse our collection of 500+ professional mockup templates
            </p>
          </div>

          <TemplatesGallery
            onTemplateSelect={handleTemplateSelect}
            showSearch={true}
            showCategories={true}
            showStats={true}
          />
        </div>
      </div>
    </div>
  );
}
