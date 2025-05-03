import { Card } from '@/components/ui/card';
import { getSimulations } from './data-access';
import { Suspense } from 'react';
import { SimulationHistoryTable } from './SimulationHistoryTable';

export default async function HistoryPage() {
  const simulations = await getSimulations();

  return (
    <div className="w-full h-screen pt-[10em] bg-black bg-contain bg-no-repeat bg-center relative overflow-x-hidden p-6">
      {/* Main content container with transition effect */}
      <div className={'w-full transition-transform duration-300 ease-in-out'}>
        <Card className="relative bg-gray-900 rounded-lg border border-white/10 p-6 w-full">
          <Suspense fallback={<div className="text-white">Loading simulation history...</div>}>
            <SimulationHistoryTable initialData={simulations} />
          </Suspense>
        </Card>
      </div>
    </div>
  );
}
