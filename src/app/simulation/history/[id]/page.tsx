'use server';

import { getSimulationById } from '../data-access';
import { getSimulationSteps } from '../steps-data-access';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { stepColumns } from './step-columns';
import { Suspense } from 'react';

// This page displays a simulation's data in JSON format
export default async function SimulationDetailPage({ params }: { params: { id: string } }) {
  const simulationId = params.id;
  const simulation = await getSimulationById(simulationId);
  const steps = await getSimulationSteps(simulationId);

  if (!simulation) {
    notFound();
  }

  return (
    <div className="w-full h-screen pt-[10em] bg-black bg-contain bg-no-repeat bg-center relative overflow-x-hidden p-6">
      <div className="w-full transition-transform duration-300 ease-in-out">
        <div className="mb-4">
          <Button variant="outline" className="text-black" asChild>
            <Link href="/simulation/history">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Simulations
            </Link>
          </Button>
        </div>

        <Card className="relative bg-gray-900 rounded-lg border border-white/10 p-6 w-full">
          <h1 className="text-2xl font-bold text-white mb-4">
            {simulation.name || `Simulation ${simulation.id.substring(0, 8)}`}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="text-white">
              <p>
                <span className="font-medium">ID:</span> {simulation.id}
              </p>
              <p>
                <span className="font-medium">Created:</span>{' '}
                {simulation.createdAt.toLocaleString()}
              </p>
              <p>
                <span className="font-medium">Updated:</span>{' '}
                {simulation.updatedAt.toLocaleString()}
              </p>
              <p>
                <span className="font-medium">Last Step:</span> {simulation.lastStep}
              </p>
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-md overflow-auto">
            <h2 className="text-xl font-semibold text-white mb-2">Configuration JSON</h2>
            <pre className="text-white font-mono text-sm overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(simulation.configuration, null, 2)}
            </pre>
          </div>

          <div className="bg-gray-800 p-4 rounded-md overflow-auto mt-4">
            <h2 className="text-xl font-semibold text-white mb-2">Full Simulation JSON</h2>
            <pre className="text-white font-mono text-sm overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(simulation, null, 2)}
            </pre>
          </div>
          
          {/* Simulation Steps Data Table */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-4">Simulation Steps</h2>
            <Card className="bg-gray-900 rounded-lg border border-white/10 p-6 w-full">
              <Suspense fallback={<div className="text-white">Loading simulation steps...</div>}>
                <DataTable
                  columns={stepColumns}
                  data={steps}
                  searchColumn="stepNumber"
                  searchPlaceholder="Search by step number..."
                />
              </Suspense>
            </Card>
          </div>
          
          {/* Step Details (Hidden by default) */}
          <div className="mt-4">
            {steps.map((step) => (
              <div
                key={step.id}
                id={`step-${step.stepNumber}-detail`}
                className="hidden bg-gray-800 p-4 rounded-md overflow-auto mt-2"
              >
                <h3 className="text-lg font-semibold text-white mb-2">
                  Step {step.stepNumber} Details
                </h3>
                <pre className="text-white font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(step.stepData, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
