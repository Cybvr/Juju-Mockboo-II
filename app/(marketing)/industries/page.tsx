
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { industriesData } from '@/data/industriesData';

export default function IndustriesPage() {
  return (
    <div className="min-h-screen mt-4 lg:mt-16">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl lg:text-6xl font-bold mb-6">
          Solutions for Every Industry
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Discover how JUJU transforms creative workflows across industries. 
          From e-commerce to real estate, we help businesses create professional visuals faster and cheaper.
        </p>
        <Button size="lg" asChild>
          <Link href="/dashboard">
            Start Creating Today →
          </Link>
        </Button>
      </div>

      {/* Industries Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {industriesData.map((industry) => (
            <Link key={industry.id} href={`/industries/${industry.slug}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                  <Image
                    src={industry.image}
                    alt={industry.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute top-4 left-4 text-4xl">
                    {industry.icon}
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {industry.title}
                  </CardTitle>
                  <CardDescription>
                    {industry.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium inline-block">
                    {industry.benefit}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-muted/50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Industry?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of businesses who've revolutionized their creative workflows with JUJU.
          </p>
          <Button size="lg" asChild>
            <Link href="/dashboard">
              Get Started Free →
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
