'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MarketingHeader } from '@/app/common/marketing/Header';
import { MarketingFooter } from '@/app/common/marketing/Footer';
import { Gallery3DHero } from '@/app/common/hero';
import AuthModal from '@/components/AuthModal';
import InstallPWA from '@/components/InstallPWA';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { productsData } from '@/data/productsData';
import { VideoCarousel } from '@/app/common/video-carousel';

export default function LandingPage() {
  const router = useRouter();
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

  return (
    <div className="min-h-screen">
      <MarketingHeader onAuthClick={() => setAuthModalOpen(true)} />

      {/* 3D Hero Section */}
      <Gallery3DHero 
        onAuthClick={() => setAuthModalOpen(true)}
        onNavigate={(path) => router.push(path)}
      />

      {/* Video Carousel Section */}
      <VideoCarousel 
        autoPlay={false}
      />

      <div className="mx-auto max-w-6xl">
        {/* Creative Tools Unified Section */}
        <div className="px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-semibold mb-4">Creative Tools</h2>
            <p className="text-xl text-muted-foreground">Everything you need to bring your ideas to life</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
            {/* Vertical Tabs */}
            <div className="lg:w-1/4 w-full">
              <div className="flex lg:flex-col flex-row gap-2 lg:space-y-2 lg:space-x-0 space-x-2 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0">
                {productsData.map((product, index) => (
                  <button
                    key={product.id}
                    onClick={() => setActiveIndex(index)}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-lg text-left transition-all duration-300 whitespace-nowrap lg:whitespace-normal flex-shrink-0 lg:flex-shrink lg:w-full",
                      activeIndex === index 
                        ? "bg-primary text-primary-foreground shadow-lg" 
                        : "bg-card hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className="text-2xl">{product.icon}</div>
                    <div>
                      <h3 className="font-semibold text-sm">{product.title}</h3>
                      <p className="text-xs opacity-80">{product.description.split(' ').slice(0, 2).join(' ')}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:w-3/4 w-full">
              <div className={cn(
                "transition-all duration-500",
                isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
              )}>
                {productsData.map((product, index) => (
                  activeIndex === index && (
                    <div key={product.id} className="grid md:grid-cols-2 gap-8 items-center">
                      <div className={index === 1 ? "space-y-6 order-2 md:order-1" : "space-y-6"}>
                        <div>
                          <h3 className="text-2xl font-semibold mb-3">{product.benefit}</h3>
                          <p className="text-muted-foreground mb-4">{product.description}</p>
                        </div>
                        <div className="space-y-3">
                          {product.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                        <Button 
                          size="lg" 
                          onClick={() => router.push(product.buttonAction)}
                          className="w-full md:w-auto"
                        >
                          {product.buttonText}
                        </Button>
                      </div>
                      <div className={index === 1 ? "order-1 md:order-2" : ""}>
                        <img src={product.image} alt={`${product.title} showcase`} className="w-full h-auto rounded-xl" />
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Get Started Section */}
        <div className="px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-semibold mb-4">Start Creating Today</h2>
            <p className="text-xl text-muted-foreground">Join thousands of creators bringing their ideas to life with AI</p>
          </div>
          <div className="text-center">
            <Button
              size="lg"
              onClick={() => setAuthModalOpen(true)}
              className="mb-4"
            >
              Get Started Free
            </Button>
            <div className="space-x-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/templates')}
              >
                View Templates
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/pricing')}
              >
                See Pricing
              </Button>
            </div>
          </div>
        </div>

        <div className="px-6 pb-12">

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

          {/* CTA to Pricing */}
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-semibold mb-4">Ready to get started?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Choose the perfect plan for your creative journey. Start free, upgrade when you're ready.
            </p>
            <Button size="lg" onClick={() => router.push('/pricing')}>
              View Pricing Plans
            </Button>
          </div>
        </div>

      </div>
      <MarketingFooter />
      <InstallPWA />
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
}