'use client';

import { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import { Simulation } from './columns';
import { useRouter } from 'next/navigation';
import { deleteSimulations } from './actions';

// Client component to handle row clicks, selection, and navigation
export function SimulationHistoryTable({ initialData }: { initialData: Simulation[] }) {
  const router = useRouter();
  const [data, setData] = useState<Simulation[]>(initialData);
  const [selectedRowIds, setSelectedRowIds] = useState<Record<string, boolean>>({});

  // Handle row click to navigate to simulation details
  const handleRowClick = (simulation: Simulation) => {
    router.push(`/simulation/history/${simulation.id}`);
  };

  // State for tracking delete operation
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Handle deleting selected simulations
  const handleDeleteSelected = async () => {
    // Get all selected simulation IDs
    console.log('Selected row IDs:', selectedRowIds);

    // With our DataTable getRowId implementation, the keys in selectedRowIds are now actual simulation UUIDs
    const selectedIds = Object.keys(selectedRowIds).filter((id) => selectedRowIds[id]);

    console.log(`Deleting ${selectedIds.length} simulations with IDs:`, selectedIds);
    if (selectedIds.length === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedIds.length} simulation(s)?`,
    );

    if (confirmed) {
      try {
        setIsDeleting(true);
        setDeleteError(null);

        // Call the server action to delete the simulations
        const result = await deleteSimulations(selectedIds);

        if (result.success) {
          // Update local data by filtering out deleted simulations
          setData((prevData) => prevData.filter((sim) => !selectedIds.includes(sim.id)));

          // Clear selection
          setSelectedRowIds({});

          // Refresh the page to get the latest data
          router.refresh();
        } else {
          setDeleteError(result.message || 'Failed to delete simulations');
        }
      } catch (error) {
        console.error('Error deleting simulations:', error);
        setDeleteError('An unexpected error occurred');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div>
      <DataTable
        columns={columns}
        data={data}
        searchColumn="name"
        searchPlaceholder="Search simulations..."
        onRowClick={handleRowClick}
        enableRowSelection={true}
        onDeleteSelected={handleDeleteSelected}
        rowSelection={selectedRowIds}
        onRowSelectionChange={setSelectedRowIds}
      />
    </div>
  );
}
