
'use client';
import { use } from 'react';
import { notFound } from 'next/navigation';
import { productsData } from '@/data/productsData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface FeaturePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function FeaturePage({ params }: FeaturePageProps) {
  const { slug } = use(params);
  const feature = productsData.find(f => f.slug === slug);

  if (!feature) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-8 mx-auto max-w-5xl">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Feature Hero */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-6">
            <Badge variant="secondary" className="w-fit">
              Feature
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-normal leading-tight">
              {feature.title}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {feature.description}
            </p>
            <div className="flex gap-4">
              <Link href={feature.href}>
                <Button size="lg" className="gap-2">
                  Get Started
                  <ArrowUpRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-96 object-cover"
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Feature Details */}
        <div className="space-y-12">
          <section className="space-y-6">
            <h2 className="text-3xl font-normal">
              About {feature.title}
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                {feature.longDescription}
              </p>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-3xl font-normal">
              Key Benefits
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {feature.benefits.map((benefit, index) => (
                <Card key={index} className="p-6">
                  <CardContent className="p-0 space-y-3">
                    <h3 className="text-xl font-medium">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="text-center space-y-6 py-12 gap-2">
            <h2 className="text-3xl font-normal">
              Ready to get started?
            </h2>
            <p className="text-xl text-muted-foreground">
              Try {feature.title} today and see what you can create.
            </p>
            <Link href={feature.href}>
              <Button size="lg" className="gap-2 mt-4 ">
                Start Creating
                <ArrowUpRight className="w-5 h-5" />
              </Button>
            </Link>
          </section>

          {/* Other Products */}
          <section className="space-y-6 py-12 border-t">
            <h2 className="text-3xl font-normal text-center">
              Explore Other Products
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {productsData.filter(product => product.slug !== slug).map((product) => (
                <Link key={product.id} href={`/products/${product.slug}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-0">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-medium text-sm">{product.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {product.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
