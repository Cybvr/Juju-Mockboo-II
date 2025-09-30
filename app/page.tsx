'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { MarketingHeader } from '@/app/common/marketing/Header';
import { MarketingFooter } from '@/app/common/marketing/Footer';
import Hero from '@/app/common/marketing/Hero';
import { CommunityGallery } from '@/app/common/CommunityGallery';
import AuthModal from '@/components/AuthModal';
import InstallPWA from '@/components/InstallPWA';
import { documentService } from '@/services/documentService';
import { Document } from '@/types/firebase';
import { Button } from '@/components/ui/button';
import { PricingTable } from '@/components/PricingTable';
import FAQSection from '@/app/common/marketing/FAQSection';
import { toolsData } from '@/data/toolsData';
import { cn } from '@/lib/utils';
import { VisualNeedsSection } from '@/app/common/marketing/VisualNeedsSection';
export default function LandingPage() {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const features = [
    {
      title: 'Mind-to-Visual Pipeline',
      description: 'Describe your vision in plain English.'
    },
    {
      title: 'Conversion Optimization AI',
      description: 'Our AI learns what converts in your industry.'
    },
    {
      title: 'Brand DNA Recognition',
      description: 'Maintains perfect brand consistency automatically.'
    }
  ];
  const valueProps = [
    {
      image: 'assets/images/marketing/consistent.jpg',
      title: 'Brand DNA consistency',
      description: 'Maintain perfect brand voice across all content automatically - no more off-brand variations'
    },
    {
      image: 'assets/images/marketing/ugc.jpg',
      title: 'UGC-style authenticity',
      description: 'Generate genuine-looking user content that builds trust and drives conversions'
    },
    {
      image: 'assets/images/marketing/cans.jpg',
      title: 'Endless possibilities',
        description: 'Test unlimited variations and styles without additional costs'
    }
  ];
  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setDocsLoading(true);
        // Only load documents if we're in the browser (not during SSR)
        if (typeof window !== 'undefined') {
          const docs = await documentService.getPopularDocuments(20);
          const publicDocs = docs.filter(doc => doc.isPublic === true);
          setDocuments(publicDocs);
        }
      } catch (error) {
        console.error('Failed to load documents:', error);
        // Set empty array on error to prevent UI issues
        setDocuments([]);
      } finally {
        setDocsLoading(false);
      }
    };
    loadDocuments();
  }, []);
  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  // Don't render the landing page if user is logged in (will redirect)
  if (user) {
    return null;
  }
  return (
    <div className="min-h-screen">
      <MarketingHeader onAuthClick={() => setAuthModalOpen(true)} />
       <div className="min-h-screen mx-auto max-w-6xl ">
      <div className="m-8"><Hero onAuthClick={() => setAuthModalOpen(true)} /></div>
      {/* Tools Gallery Section */}
      <div className="px-6 py-16">
        <img src="/assets/images/workspace.jpg" alt="Workspace" className="w-full h-auto" />
      </div>
      {/* Perfect Section */}
      <div className="mb-16">
        <VisualNeedsSection />
      </div>
      <div className=" px-6 pb-12">
        {/* Future-Forward Features */}
        <div className="mb-16 bg-black rounded-2xl p-4  lg:p-8 ">
          <div className="mb-12 text-left">
            <h2 className="text-5xl font-extralight">Beyond imagination</h2>
            <p className="text-xl text-muted-foreground">Features that feel like magic, results that drive growth</p>
          </div>
     en     <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <div>
                      <h3 className="text-xl font-normal mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card rounded-3xl p-8 border relative overflow-hidden">
              <div className="mb-6 text-left relative z-10">
                <h3 className="text-2xl font-normal mb-3">Early Adopter Advantage</h3>
              </div>
              <div className="bg-accent rounded-xl p-4 mb-6 relative z-10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Market Advantage</span>
                  <span className="text-lg font-bold text-foreground">+347%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-foreground h-2 rounded-full" style={{width: '87%'}}></div>
                </div>
              </div>
              <p className="text-muted-foreground text-sm text-left relative z-10">
                Early adopters report 3.5x faster campaign launches
              </p>
            </div>
          </div>
        </div>
        {/* Value Props - Updated with image inside */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {valueProps.map((prop, index) => (
            <div key={index} className="shadow-lg">
              <div className="mb-6 rounded-xl overflow-hidden">
                <img 
                  src={prop.image} 
                  alt={prop.title} 
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-foreground">{prop.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{prop.description}</p>
              </div>
            </div>
          ))}
        </div>
        {/* Pricing */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h2 className="text-5xl font-extralight">Simple, transparent pricing</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From hobbyists to professionals, find the perfect plan that scales with your creative ambitions.
            </p>
          </div>
          <PricingTable showCurrentPlan={false} />
        </div>
      </div>
      {/* FAQ Section */}
      <div className="mx-auto max-w-5xl px-6 mb-16">
        <FAQSection />
      </div></div>
      <MarketingFooter />
      <InstallPWA />
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
}
