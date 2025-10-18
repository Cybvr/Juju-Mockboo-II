'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ComparisonTable from '@/app/common/marketing/ComparisonTable';

export default function ComparePage() {
  return (
    <div className="min-h-screen mt-4 lg:mt-16 max-w-5xl mx-auto">
      {/* Header */}
      <div className=" border-b container pt-8 bg-card rounded-3xl p-4 outflow-auto">
        <div className="text-left items-left">
          <h1 className="text-md font-bold mb-2 text-left">
            How JUJU Compares
          </h1>
          <p className="text-md text-muted-foreground">
            See how JUJU stacks up against other design platforms. 
          </p>
        </div>
      </div>

      <div className="container px-4 py-8">
        <div className="space-y-6">
          <ComparisonTable />

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