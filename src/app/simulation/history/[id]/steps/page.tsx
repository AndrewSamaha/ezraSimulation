'use server';

import { getSimulationById } from '../../data-access';
import { getSimulationSteps } from '../../steps-data-access';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { SimulationStepsTable } from './StepsTable';
import { Suspense } from 'react';

export default async function SimulationStepsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const simulation = await getSimulationById(id);
  const steps = await getSimulationSteps(id);

  if (!simulation) {
    notFound();
  }

  return (
    <div className="w-full h-screen pt-[10em] bg-black bg-contain bg-no-repeat bg-center relative overflow-x-hidden p-6">
      <div className="w-full transition-transform duration-300 ease-in-out">
        <div className="mb-4 flex items-center justify-between">
          <Button variant="outline" className="text-black" asChild>
            <Link href={`/simulation/history/${id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Simulation Details
            </Link>
          </Button>
        </div>

        <Card className="relative bg-gray-900 rounded-lg border border-white/10 p-6 w-full">
          <h1 className="text-2xl font-bold text-white mb-4">
            {simulation.name || `Simulation ${simulation.id.substring(0, 8)}`} - Steps
          </h1>

          <div className="text-white mb-6">
            <p>
              <span className="font-medium">Simulation ID:</span> {simulation.id}
            </p>
            <p>
              <span className="font-medium">Total Steps:</span> {simulation.lastStep}
            </p>
          </div>

          {/* Simulation Steps Data Table */}
          <Suspense fallback={<div className="text-white">Loading simulation steps...</div>}>
            <SimulationStepsTable steps={steps} />
          </Suspense>
        </Card>
      </div>
    </div>
  );
}
