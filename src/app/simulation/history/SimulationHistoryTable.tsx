'use client';

import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import { Simulation } from './columns';
import { useRouter } from 'next/navigation';

// Client component to handle row clicks and navigation
export function SimulationHistoryTable({
  initialData,
}: {
  initialData: Simulation[];
}) {
  const router = useRouter();

  // Handle row click to navigate to simulation details
  const handleRowClick = (simulation: Simulation) => {
    router.push(`/simulation/history/${simulation.id}`);
  };

  return (
    <DataTable
      columns={columns}
      data={initialData}
      searchColumn="name"
      searchPlaceholder="Search simulations..."
      onRowClick={handleRowClick}
    />
  );
}
