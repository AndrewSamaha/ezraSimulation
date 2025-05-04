'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { OrganismsTableSkeleton } from './OrganismsTableSkeleton';

export default function OrganismsLoading() {
  return (
    <div className="w-full h-screen pt-[10em] bg-black bg-contain bg-no-repeat bg-center relative overflow-x-hidden p-6">
      <div className="w-full transition-transform duration-300 ease-in-out">
        <div className="mb-4 flex items-center justify-between">
          <Button variant="outline" className="text-black" disabled>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Simulation Details
          </Button>
        </div>

        <Card className="relative bg-gray-900 rounded-lg border border-white/10 p-6 w-full">
          <h1 className="text-2xl font-bold text-white mb-4">
            <Skeleton className="h-8 w-64 bg-gray-700" />
          </h1>

          <div className="text-white mb-6 space-y-2">
            <p className="flex items-center space-x-2">
              <span className="font-medium">Simulation ID:</span>
              <Skeleton className="h-4 w-64 bg-gray-700" />
            </p>
            <p className="flex items-center space-x-2">
              <span className="font-medium">Organisms Found:</span>
              <Skeleton className="h-4 w-12 bg-gray-700" />
            </p>
          </div>

          {/* Organisms Skeleton */}
          <OrganismsTableSkeleton />
        </Card>
      </div>
    </div>
  );
}
