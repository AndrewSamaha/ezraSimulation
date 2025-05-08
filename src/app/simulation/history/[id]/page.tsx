'use server';

import { getSimulationById } from '../data-access';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Database, Dna } from 'lucide-react';

// This page displays a simulation's data in JSON format
export default async function SimulationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const simulation = await getSimulationById(id);

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

          {/* Links to Simulation Steps and Organisms */}
          <div className="mt-8 flex flex-wrap gap-4">
            <Button variant="outline" className="text-black" asChild>
              <Link href={`/simulation/history/${id}/steps`}>
                <Database className="mr-2 h-4 w-4" />
                View Simulation Steps
              </Link>
            </Button>
            
            <Button variant="outline" className="text-black" asChild>
              <Link href={`/simulation/history/${id}/organisms`}>
                <Dna className="mr-2 h-4 w-4" />
                View Simulation Organisms
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
