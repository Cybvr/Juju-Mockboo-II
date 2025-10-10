
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Palette, Layers, Zap, Infinity } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function MixboardPage() {
  const features = [
    {
      icon: Palette,
      title: "Infinite Canvas",
      description: "Create without limits on an endless canvas that scales with your imagination"
    },
    {
      icon: Layers,
      title: "Layer Management",
      description: "Organize your designs with powerful layering tools and blend modes"
    },
    {
      icon: Zap,
      title: "AI-Powered Tools",
      description: "Generate graphics, remove backgrounds, and enhance images with AI"
    },
    {
      icon: Infinity,
      title: "Real-time Collaboration",
      description: "Work together with your team in real-time, anywhere in the world"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-24 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="secondary" className="mb-6">
                🎨 Mixboard
              </Badge>
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                Design Without Limits
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Professional design tool with infinite canvas, AI-powered features, and real-time collaboration. Perfect for graphics, mockups, and creative projects.
              </p>
              <div className="flex gap-4">
                <Link href="/dashboard/canvas">
                  <Button size="lg" className="gap-2">
                    Start Designing
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" size="lg">
                    View Examples
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/assets/images/workspace.jpg"
                alt="Mixboard Interface"
                width={600}
                height={400}
                className="rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything You Need to Create</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful tools that adapt to your creative workflow
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-8">
                  <feature.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Creating?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of designers who trust Mixboard for their creative projects
          </p>
          <Link href="/dashboard/canvas">
            <Button size="lg" className="gap-2">
              Launch Mixboard
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
