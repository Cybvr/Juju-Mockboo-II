'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight } from 'lucide-react';
import { productsData } from '@/data/productsData';
import Link from 'next/link';

export default function ToolsPage() {
  return (
    <div className="min-h-screen py-24">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <Badge variant="secondary" className="w-fit mb-6">
            All Products
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-normal leading-tight mb-6">
            Powerful Creative Products
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Discover all the amazing products that make Juju the perfect platform for your creative needs.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {productsData.map((feature) => (
            <Link key={feature.id} href={feature.href} className="block">
              <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer h-full">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                        {feature.description}
                      </p>

                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}