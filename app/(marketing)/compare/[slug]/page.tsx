
'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import { comparisonData, competitors } from '@/data/compareData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Star, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface ComparePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function CompetitorComparePage({ params }: ComparePageProps) {
  const { slug } = use(params);
  const competitor = competitors[slug];

  if (!competitor) {
    notFound();
  }

  const renderFeatureValue = (value: string | boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="h-5 w-5 text-green-500" />
      ) : (
        <X className="h-5 w-5 text-red-500" />
      );
    }

    if (value.includes('✓')) {
      return <span className="text-green-600 font-medium">{value}</span>;
    }

    if (value === 'Limited' || value === 'Basic') {
      return <span className="text-yellow-600">{value}</span>;
    }

    return <span className="text-muted-foreground">{value}</span>;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/compare">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Full Comparison
              </Button>
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              JUJU vs {competitor.name}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {competitor.description}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Feature Comparison</span>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
                      <Image src="/images/juju.png" alt="JUJU" width={24} height={24} />
                    </div>
                    <span className="font-medium">JUJU</span>
                  </div>
                  <span className="text-muted-foreground">vs</span>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                      <span className="text-xs font-bold">
                        {competitor.name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-medium">{competitor.name}</span>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {comparisonData.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg border bg-card/50"
                  >
                    <div className="font-medium">{item.feature}</div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-primary" />
                      {renderFeatureValue(item.juju)}
                    </div>
                    <div className="flex items-center gap-2">
                      {renderFeatureValue(item[slug as keyof typeof item] as string | boolean)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Other Comparisons */}
          <div className="border-t pt-6">
            <h2 className="text-2xl font-bold mb-4 text-center">Compare with Others</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {Object.entries(competitors)
                .filter(([key]) => key !== slug)
                .map(([key, comp]) => (
                  <Link key={key} href={`/compare/${key}`}>
                    <Button variant="outline" className="flex items-center gap-2">
                      <span>JUJU vs {comp.name}</span>
                    </Button>
                  </Link>
                ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center pt-6 border-t">
            <Link href="/dashboard">
              <Button size="lg" className="bg-primary text-white">
                Start Creating with JUJU
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-2">
              Join thousands of creators who've made the switch
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
