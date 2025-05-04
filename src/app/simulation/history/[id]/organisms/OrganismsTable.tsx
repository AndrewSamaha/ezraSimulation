'use client';

import { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { organismColumns } from '../organism-columns';
import { SimulationOrganism } from '../../organisms-data-access';

export function OrganismsTable({ organisms }: { organisms: SimulationOrganism[] }) {
  const [expandedOrgIds, setExpandedOrgIds] = useState<Set<string>>(new Set());

  // Handle row click to toggle organism details
  const handleRowClick = (organism: SimulationOrganism) => {
    setExpandedOrgIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(organism.id)) {
        newSet.delete(organism.id);
      } else {
        newSet.add(organism.id);
      }
      return newSet;
    });
  };

  return (
    <div>
      <DataTable
        columns={organismColumns}
        data={organisms}
        searchColumn="id"
        searchPlaceholder="Search by organism ID..."
        onRowClick={handleRowClick}
      />
      
      {/* Organism Details (Hidden by default, shown when row is clicked) */}
      <div className="mt-4">
        {organisms.map((organism) => (
          <div
            key={organism.id}
            id={`organism-${organism.id}-detail`}
            className={expandedOrgIds.has(organism.id) ? 'bg-gray-800 p-4 rounded-md overflow-auto mt-2' : 'hidden'}
          >
            <h3 className="text-lg font-semibold text-white mb-2">
              Organism Details: {organism.id}
            </h3>
            <pre className="text-white font-mono text-sm overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(organism, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
