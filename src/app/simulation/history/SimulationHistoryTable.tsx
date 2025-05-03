'use server';

import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import { Simulation } from './columns';

// Client component to prevent server component from re-rendering
export async function SimulationHistoryTable({
  initialData,
}: {
  initialData: Promise<Simulation[]>;
}) {
  // Store the data in state to prevent continuous refetching
  const data = await initialData;

  return (
    <DataTable
      columns={columns}
      data={data}
      searchColumn="name"
      searchPlaceholder="Search simulations..."
    />
  );
}
