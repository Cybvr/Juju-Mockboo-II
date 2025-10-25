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
import { Playfair_Display } from 'next/font/google';

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
});

export default function LandingPage() {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

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
                <h1 className={cn("text-5xl lg:text-7xl font-semibold text-foreground mb-6 leading-tight", playfair.className)}>
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

        {/* Tools Gallery Section */}
        <div className="px-6 py-16">
          <img src="/assets/images/workspace.jpg" alt="Workspace" className="w-full h-auto rounded-2xl shadow-2xl" />
        </div>

        {/* Use Cases Section */}
        <div className="mb-16">
          <div className="text-foreground">
            <div className="max-w-7xl mx-auto p-6">
              <div className="max-w-7xl mx-auto p-6 mb-12 text-left">
                <h2 className={cn("text-4xl lg:text-5xl font-semibold mb-6 text-balance", playfair.className)}>
                  Your ideas deserve to be seen
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-left">
                  Whether you're launching a product, building a brand, or creating content that converts—turn concepts into visuals instantly.
                </p>
              </div>
              <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
                {/* Side Navigation */}
                <div className="w-full lg:w-64 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0">
                  {visualNeedsData.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleIndexChange(index)}
                      className={cn(
                        "group relative overflow-hidden transition-all duration-500 ease-out rounded-lg shrink-0",
                        "transform hover:scale-[1.02] hover:shadow-lg",
                        "h-12 lg:h-14 min-w-[180px] lg:min-w-0",
                        activeIndex === index 
                          ? "bg-accent shadow-md scale-[1.02]" 
                          : "hover:bg-accent/50 hover:shadow-sm",
                      )}
                    >
                      <div className="relative z-10 flex items-center h-full px-3">
                        <div className="text-left">
                          <h3
                            className={cn(
                              "font-normal text-base lg:text-lg transition-all duration-400 ease-out transform",
                              activeIndex === index 
                                ? "text-accent-foreground translate-x-1 font-medium" 
                                : "text-foreground translate-x-0 hover:translate-x-1",
                            )}
                          >
                            {item.title}
                          </h3>
                        </div>
                      </div>
                      <div 
                        className={cn(
                          "absolute left-0 top-0 bottom-0 w-1 bg-accent transition-all duration-500 ease-out transform",
                          activeIndex === index ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
                        )}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out" />
                    </button>
                  ))}
                </div>
                {/* Main Display */}
                <div className="flex-1 relative overflow-hidden rounded-xl shadow-2xl h-[500px] lg:h-[700px]">
                  {visualNeedsData.map((item, index) => (
                    <div
                      key={index}
                      className={cn(
                        "absolute inset-0 transition-all duration-700 ease-out transform",
                        activeIndex === index 
                          ? "opacity-100 scale-100" 
                          : "opacity-0 scale-105"
                      )}
                    >
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    </div>
                  ))}
                  <div className="relative z-10 h-full flex flex-col justify-end p-6 lg:p-12">
                    <div className="max-w-2xl">
                      <h3 
                        className={cn(
                          "text-xl lg:text-2xl font-semibold text-balance text-white transition-all duration-500 ease-out transform",
                          playfair.className,
                          isTransitioning 
                            ? "translate-y-4 opacity-0" 
                            : "translate-y-0 opacity-100"
                        )}
                        style={{ transitionDelay: '100ms' }}
                      >
                        {visualNeedsData[activeIndex].title}
                      </h3>
                      <p 
                        className={cn(
                          "text-sm lg:text-md text-gray-200/80 mb-6 leading-relaxed text-pretty transition-all duration-500 ease-out transform",
                          isTransitioning 
                            ? "translate-y-4 opacity-0" 
                            : "translate-y-0 opacity-100"
                        )}
                        style={{ transitionDelay: '200ms' }}
                      >
                        {visualNeedsData[activeIndex].description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Bottom indicators */}
              <div className="hidden lg:flex justify-center mt-8 gap-3">
                {visualNeedsData.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleIndexChange(index)}
                    className={cn(
                      "h-1 rounded-full transition-all duration-400 ease-out transform hover:scale-y-150",
                      activeIndex === index 
                        ? "bg-accent w-12 scale-y-125" 
                        : "bg-muted w-6 hover:bg-muted-foreground/70"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-12">
          {/* How It Works */}
          <div className="mb-16 rounded-2xl p-4 lg:p-8">
            <div className="mb-12 text-left">
              <h2 className={cn("text-4xl lg:text-5xl font-semibold mb-4", playfair.className)}>Three steps to visual perfection</h2>
              <p className="text-xl text-muted-foreground">It's so simple, you'll wonder why you ever did it any other way</p>
            </div>
            <div className="grid lg:grid-cols-3 gap-12 items-start">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <div>
                    <div className="text-sm text-accent font-mono mb-2">0{index + 1}</div>
                    <h3 className={cn("text-2xl font-semibold mb-3", playfair.className)}>{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Results Section */}
          <div className="mb-16 grid md:grid-cols-3 gap-8">
            {[
              { metric: '10x', label: 'Faster than traditional design' },
              { metric: '$0', label: 'Design agency fees saved' },
              { metric: '∞', label: 'Iterations without extra cost' }
            ].map((stat, index) => (
              <div key={index} className="bg-card border rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
                <div className={cn("text-5xl font-semibold text-foreground mb-3", playfair.className)}>{stat.metric}</div>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
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
                  <h3 className={cn("text-xl font-semibold text-foreground", playfair.className)}>{prop.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{prop.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="mb-8">
            <div className="text-center mb-8">
              <h2 className={cn("text-4xl lg:text-5xl font-semibold mb-4", playfair.className)}>Simple, transparent pricing</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Start free. Scale as you grow. No hidden fees, no surprises.
              </p>
            </div>
            <PricingTable showCurrentPlan={false} />
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mx-auto max-w-5xl px-6 mb-16">
          <FAQSection />
        </div>

        {/* Final CTA */}
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className={cn("text-4xl lg:text-5xl font-semibold mb-6", playfair.className)}>
            Stop dreaming. Start creating.
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of creators who've ditched design bottlenecks and unlocked their creative potential.
          </p>
          {!loading && user ? (
            <Button
              size="lg"
              className="px-10 py-6 text-xl rounded-full bg-white hover:bg-white/90 text-black hover:text-black border-0 shadow-lg"
              onClick={() => router.push('/dashboard')}
            >
              Go to Dashboard →
            </Button>
          ) : (
            <Button
              size="lg"
              className="px-10 py-6 text-xl rounded-full bg-white hover:bg-white/90 text-black hover:text-black border-0 shadow-lg"
              onClick={() => setAuthModalOpen(true)}
            >
              Start Creating Free →
            </Button>
          )}
          <p className="text-sm text-muted-foreground mt-6">No credit card required. Cancel anytime.</p>
        </div>
      </div>

      <MarketingFooter />
      <InstallPWA />
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
}