'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { MarketingHeader } from '@/app/common/marketing/Header';
import { MarketingFooter } from '@/app/common/marketing/Footer';
import AuthModal from '@/components/AuthModal';
import InstallPWA from '@/components/InstallPWA';
import { Button } from '@/components/ui/button';
import { PricingTable } from '@/components/PricingTable';
import FAQSection from '@/app/common/marketing/FAQSection';
import { cn } from '@/lib/utils';
import { visualNeedsData } from '@/data/industryData';
import { Card } from '@/components/ui/card';
import { Play, FileText } from 'lucide-react';

// Import the stories service
import { getAllStories } from '@/services/storiesService';

// Fetch public stories using the same logic as templates page
async function fetchPublicStories() {
  try {
    const allStories = await getAllStories();
    const publicStories = allStories.filter(story => story.isPublic);
    // Sort by creation date in descending order and take the latest 3
    return publicStories.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 3);
  } catch (error) {
    console.error('Error fetching public stories:', error);
    return [];
  }
}

export default function LandingPage() {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [recentStories, setRecentStories] = useState([]);
  const [storiesLoading, setStoriesLoading] = useState(true);

  const handleIndexChange = (newIndex: number) => {
    if (newIndex === activeIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 400);
    setActiveIndex(newIndex);
  };
  const features = [
    {
      title: 'Dream It',
      description: 'Describe your vision in plain English. No design skills needed.'
    },
    {
      title: 'Design It',
      description: 'Watch AI bring your ideas to life in seconds. Iterate instantly.'
    },
    {
      title: 'Done',
      description: 'Export, share, or keep refining. Ship faster than ever before.'
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

  // Fetch recent stories when the component mounts
  useEffect(() => {
    setStoriesLoading(true);
    fetchPublicStories().then(stories => {
      setRecentStories(stories);
      setStoriesLoading(false);
    });
  }, []);

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);
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

  return (
    <div className="min-h-screen">
      <MarketingHeader onAuthClick={() => setAuthModalOpen(true)} />
      <div className="min-h-screen mx-auto max-w-6xl">
        <div className="m-8">
          <div className="lg:pt-12 pt-6">
            <div className="flex flex-col items-center">
              <div className="mb-12 items-center text-center">
                {/* Updated Hero */}
                <h1 className="text-5xl lg:text-7xl font-semibold text-foreground mb-6 leading-tight">
                  Dream It.<br />Design It.<br />Done.
                </h1>
                <p className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
                  Turn your ideas into stunning visuals in seconds. No design skills required. Just imagination and AI.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {!loading && user ? (
                    <Button
                      size="lg"
                      className="px-8 py-6 text-lg rounded-full bg-white hover:bg-white/90 text-black hover:text-black border-0 shadow-lg"
                      onClick={() => router.push('/dashboard')}
                    >
                      Go to Dashboard
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      className="px-8 py-6 text-lg rounded-full bg-white hover:bg-white/90 text-black hover:text-black border-0 shadow-lg"
                      onClick={() => setAuthModalOpen(true)}
                    >
                      Start Creating Free
                    </Button>
                  )}
                </div>
                {/* Social Proof */}
                <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 border-2 border-background" />
                      ))}
                    </div>
                    <span>10,000+ creators</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>⭐⭐⭐⭐⭐</span>
                    <span>4.9/5 rating</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Stories Section - moved up */}
        <div className="px-6 py-16">
          {storiesLoading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-video bg-muted rounded-xl mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : recentStories.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              {recentStories.map((story) => {
                const firstVideoScene = story.storyboard?.find(scene => scene.videoUrl);
                const firstImageUrl = story.storyboard?.[0]?.imageUrl;

                return (
                  <Card
                    key={story.id}
                    className="group cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                    onClick={() => router.push(`/dashboard/stories/${story.id}`)}
                  >
                    <div className="relative aspect-video bg-muted">
                      {firstImageUrl ? (
                        <img 
                          src={firstImageUrl} 
                          alt="Story thumbnail" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <FileText className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}

                      {/* Video preview on hover if available */}
                      {firstVideoScene?.videoUrl && (
                        <video
                          src={firstVideoScene.videoUrl}
                          className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          autoPlay
                          muted
                          loop
                          playsInline
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}

                      {/* Play overlay */}
                      {firstVideoScene?.videoUrl && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-white/20 backdrop-blur rounded-full p-4">
                            <Play className="w-8 h-8 text-white" fill="white" />
                          </div>
                        </div>
                      )}

                      {/* Title overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <h3 className="text-white font-medium text-sm truncate">
                          {story.title}
                        </h3>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Create Your First Story</h3>
              <p className="text-muted-foreground mb-6">
                Start creating amazing video stories with AI
              </p>
              {!loading && user ? (
                <Button
                  size="lg"
                  onClick={() => router.push('/dashboard/stories')}
                >
                  Create Your First Story
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={() => setAuthModalOpen(true)}
                >
                  Get Started Free
                </Button>
              )}
            </div>
          )}

          {recentStories.length > 0 && (
            <div className="text-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/templates')}
              >
                View All Templates →
              </Button>
            </div>
          )}
        </div>

        {/* Tools Gallery Section */}
        <div className="px-6 py-16">
          <img src="/assets/images/workspace.jpg" alt="Workspace" className="w-full h-auto rounded-2xl shadow-2xl" />
        </div>
        <div className="px-6 pb-12">
          {/* How It Works */}
          <div className="mb-16 rounded-2xl p-4 lg:p-8">
            <div className="mb-12 text-left">
              <h2 className="text-4xl lg:text-5xl font-semibold mb-4">Three steps to visual perfection</h2>
              <p className="text-xl text-muted-foreground">It's so simple, you'll wonder why you ever did it any other way</p>
            </div>
            <div className="grid lg:grid-cols-3 gap-12 items-start">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <div>
                    <div className="text-sm text-accent font-mono mb-2">0{index + 1}</div>
                    <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Value Props */}
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
              <h2 className="text-4xl lg:text-5xl font-semibold mb-4">Simple, transparent pricing</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Start free. Scale as you grow. No hidden fees, no surprises.
              </p>
            </div>
            <PricingTable showCurrentPlan={false} />
          </div>
        </div>

        
      </div>
      <MarketingFooter />
      <InstallPWA />
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
}