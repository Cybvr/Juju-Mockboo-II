
'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import { getTeamBySlug } from '@/data/teamsData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRight, ArrowLeft, CheckCircle, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface TeamPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function TeamPage({ params }: TeamPageProps) {
  const { slug } = use(params);
  const team = getTeamBySlug(slug);

  if (!team) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-8 mx-auto max-w-5xl">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/teams">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Teams
            </Button>
          </Link>
        </div>

        {/* Team Hero */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-6">
            <Badge variant="secondary" className="w-fit">
              <Users className="w-4 h-4 mr-2" />
              Team Solution
            </Badge>
            <div className="flex items-center gap-4">
              <span className="text-4xl">{team.icon}</span>
              <h1 className="text-4xl lg:text-6xl font-normal leading-tight">
                {team.title}
              </h1>
            </div>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {team.description}
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-700 font-medium">
                <CheckCircle className="w-5 h-5" />
                {team.benefit}
              </div>
            </div>
            <div className="flex gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="gap-2">
                  Start Free Trial
                  <ArrowUpRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <Image
                  src={team.image}
                  alt={team.title}
                  width={600}
                  height={400}
                  className="w-full h-96 object-cover"
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Challenges & Solutions */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <section className="space-y-6">
            <h2 className="text-3xl font-normal">Common Challenges</h2>
            <div className="space-y-4">
              {team.challenges.map((challenge, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-red-800">{challenge}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-3xl font-normal">JUJU Solutions</h2>
            <div className="space-y-4">
              {team.solutions.map((solution, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <p className="text-green-800">{solution}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Use Cases */}
        <section className="space-y-6 mb-16">
          <h2 className="text-3xl font-normal">Perfect For</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.useCases.map((useCase, index) => (
              <Card key={index} className="p-6 text-center">
                <CardContent className="p-0">
                  <h3 className="font-medium">{useCase}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Tools */}
        <section className="space-y-6 mb-16">
          <h2 className="text-3xl font-normal">Recommended Tools</h2>
          <div className="flex flex-wrap gap-3">
            {team.tools.map((tool, index) => (
              <Badge key={index} variant="outline" className="text-base px-4 py-2">
                {tool}
              </Badge>
            ))}
          </div>
        </section>

        {/* Testimonial */}
        <section className="bg-muted/20 rounded-2xl p-8 mb-16">
          <div className="text-center space-y-4">
            <blockquote className="text-2xl font-normal italic">
              "{team.testimonial.quote}"
            </blockquote>
            <div className="space-y-1">
              <div className="font-medium">{team.testimonial.author}</div>
              <div className="text-muted-foreground">{team.testimonial.role}</div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center space-y-6 py-12">
          <h2 className="text-3xl font-normal">
            Ready to Transform Your {team.title}?
          </h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of teams already creating faster with JUJU.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2">
                Start Free Trial
                <ArrowUpRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline">
                View Team Pricing
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
