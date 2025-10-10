
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { getIndustryBySlug } from '@/data/industriesData';
import { notFound } from 'next/navigation';
import { CheckCircle, ArrowRight } from 'lucide-react';

interface IndustryPageProps {
  params: { slug: string };
}

export default function IndustryPage({ params }: IndustryPageProps) {
  const industry = getIndustryBySlug(params.slug);
  
  if (!industry) {
    notFound();
  }

  return (
    <div className="min-h-screen mt-4 lg:mt-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={industry.image}
            alt={industry.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative container mx-auto px-4 py-24 text-center text-white">
          <div className="text-6xl mb-4">{industry.icon}</div>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            {industry.title} Solutions
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            {industry.description}
          </p>
          <div className="bg-primary/20 backdrop-blur-sm text-primary-foreground px-6 py-3 rounded-full text-lg font-semibold inline-block mb-8">
            {industry.benefit}
          </div>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/dashboard">
                Start Free Trial →
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
              View Examples
            </Button>
          </div>
        </div>
      </div>

      {/* Challenges & Solutions */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Challenges */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-red-600">Common Challenges</CardTitle>
              <CardDescription>Issues facing {industry.title.toLowerCase()} businesses today</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {industry.challenges.map((challenge, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 shrink-0" />
                  <span>{challenge}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Solutions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-green-600">JUJU Solutions</CardTitle>
              <CardDescription>How we solve these problems for you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {industry.solutions.map((solution, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                  <span>{solution}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Use Cases */}
      <div className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Use Cases</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {industry.useCases.map((useCase, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <ArrowRight className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">{useCase}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonial */}
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-12 text-center">
            <blockquote className="text-2xl italic mb-6">
              "{industry.testimonial.quote}"
            </blockquote>
            <div>
              <div className="font-semibold text-lg">{industry.testimonial.author}</div>
              <div className="text-muted-foreground">{industry.testimonial.role}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Final CTA */}
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your {industry.title} Business?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of {industry.title.toLowerCase()} businesses creating professional visuals with JUJU.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/dashboard">
              Start Free Trial →
            </Link>
          </Button>
          <p className="text-sm mt-4 opacity-75">No credit card required. Cancel anytime.</p>
        </div>
      </div>
    </div>
  );
}
