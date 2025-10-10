
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { teamsData } from '@/data/teamsData';

export default function TeamsPage() {
  return (
    <div className="min-h-screen mt-4 lg:mt-16">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl lg:text-6xl font-bold mb-6">
          Built for Every Team
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          From design to production, marketing to IT - JUJU empowers teams across your organization 
          to create professional visuals faster and more efficiently.
        </p>
        <Button size="lg" asChild>
          <Link href="/dashboard">
            Start Your Team Trial →
          </Link>
        </Button>
      </div>

      {/* Teams Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamsData.map((team) => (
            <Link key={team.id} href={`/teams/${team.slug}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="aspect-video relative overflow-hidden rounded-t-lg">
                  <Image
                    src={team.image}
                    alt={team.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{team.icon}</span>
                    <div>
                      <CardTitle className="text-xl">{team.title}</CardTitle>
                      <div className="text-sm text-green-600 font-medium mt-1">
                        {team.benefit}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base mb-4">
                    {team.description}
                  </CardDescription>
                  <div className="flex flex-wrap gap-2">
                    {team.tools.slice(0, 3).map((tool) => (
                      <span key={tool} className="text-xs bg-muted px-2 py-1 rounded">
                        {tool}
                      </span>
                    ))}
                    {team.tools.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{team.tools.length - 3} more
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-muted/20 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Transform Your Team's Workflow?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of teams already creating faster, better content with JUJU.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/dashboard">
                Start Free Trial
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/pricing">
                View Team Pricing
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
