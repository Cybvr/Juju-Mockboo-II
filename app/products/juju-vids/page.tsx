
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Video, Wand2, Scissors, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function JujuVidsPage() {
  const features = [
    {
      icon: Video,
      title: "AI Video Generation",
      description: "Create professional videos from simple text descriptions in seconds"
    },
    {
      icon: Wand2,
      title: "Scene-Based Editing",
      description: "Build your story scene by scene with intuitive timeline controls"
    },
    {
      icon: Scissors,
      title: "Smart Editing Tools",
      description: "Cut, trim, and enhance your videos with AI-powered editing features"
    },
    {
      icon: Sparkles,
      title: "Effects & Transitions",
      description: "Add professional effects and smooth transitions with one click"
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
                🎬 Juju Vids
              </Badge>
              <h1 className="text-5xl font-bold mb-6 leading-tight">
                AI-Powered Video Creation
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Turn your ideas into stunning videos with AI. Create, edit, and share professional-quality videos in minutes, not hours.
              </p>
              <div className="flex gap-4">
                <Link href="/dashboard/videos">
                  <Button size="lg" className="gap-2">
                    Start Creating
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" size="lg">
                    Watch Demo
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <Image
                src="/assets/images/scenes.jpg"
                alt="Juju Vids Interface"
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
            <h2 className="text-3xl font-bold mb-4">Video Creation Made Simple</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional video tools powered by artificial intelligence
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

      {/* How It Works */}
      <div className="py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Three Steps to Great Videos</h2>
            <p className="text-xl text-muted-foreground">From idea to finished video in minutes</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="pt-8">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-lg font-semibold mb-3">Describe Your Video</h3>
                <p className="text-muted-foreground text-sm">Tell us what you want to create in simple words</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-8">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-lg font-semibold mb-3">AI Creates Scenes</h3>
                <p className="text-muted-foreground text-sm">Watch as AI generates professional video scenes</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-8">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-lg font-semibold mb-3">Edit & Share</h3>
                <p className="text-muted-foreground text-sm">Fine-tune your video and share it with the world</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Create Videos?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join creators worldwide who use Juju Vids to bring their stories to life
          </p>
          <Link href="/dashboard/videos">
            <Button size="lg" className="gap-2">
              Launch Juju Vids
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
