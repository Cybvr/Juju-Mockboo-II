'use client';
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardHeader } from '@/app/common/dashboard/Header';
import { CommunityGallery } from '@/app/common/CommunityGallery';
import { documentService } from '@/services/documentService';
import { Document } from '@/types/firebase';

export default function CommunityPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const getPublicDocumentsByCategory = async (category: string): Promise<Document[]> => {
    try {
      const docs = await documentService.getPopularDocuments(100);
      return docs.filter(doc =>
        category === 'all' || doc.type === category
      );
    } catch (error) {
      console.error('Failed to get public documents by category:', error);
      return [];
    }
  };

  const loadDocumentsByCategory = async (category: string) => {
    try {
      setLoading(true);
      const fetchedDocs = await getPublicDocumentsByCategory(category);
      setDocuments(fetchedDocs);
    } catch (error) {
      console.error('Failed to load community documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocumentsByCategory('all');
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 text-center items-center">
          <p className="text-foreground py-8 text-xl font-bold">Discover and share amazing designs from our creative community</p>
        </div>

        <Tabs defaultValue="all" className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="image">Images</TabsTrigger>
            <TabsTrigger value="mockup">Mockups</TabsTrigger>
            <TabsTrigger value="template">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <CommunityGallery documents={documents} />
          </TabsContent>

          <TabsContent value="image" className="mt-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Images</h2>
            </div>
            <CommunityGallery 
              documents={documents.filter(doc => doc.type === 'image')}
            />
          </TabsContent>

          <TabsContent value="mockup" className="mt-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Mockups</h2>
            </div>
            <CommunityGallery 
              documents={documents.filter(doc => doc.type === 'mockup')}
            />
          </TabsContent>

          <TabsContent value="template" className="mt-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Templates</h2>
            </div>
            <CommunityGallery 
              documents={documents.filter(doc => doc.type === 'template')}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}