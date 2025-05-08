'use client';

import { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { stepColumns } from '../step-columns';
import { SimulationStep } from '../../steps-data-access';

export function SimulationStepsTable({ steps }: { steps: SimulationStep[] }) {
  const [expandedStepIds, setExpandedStepIds] = useState<Set<number>>(new Set());

  // Handle row click to toggle step details
  const handleRowClick = (step: SimulationStep) => {
    setExpandedStepIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(step.stepNumber)) {
        newSet.delete(step.stepNumber);
      } else {
        newSet.add(step.stepNumber);
      }
      return newSet;
    });
  };

  return (
    <div>
      <DataTable
        columns={stepColumns}
        data={steps}
        searchColumn="stepNumber"
        searchPlaceholder="Search by step number..."
        onRowClick={handleRowClick}
      />
      
      {/* Step Details (Hidden by default, shown when row is clicked) */}
      <div className="mt-4">
        {steps.map((step) => (
          <div
            key={step.id}
            id={`step-${step.stepNumber}-detail`}
            className={expandedStepIds.has(step.stepNumber) ? 'bg-gray-800 p-4 rounded-md overflow-auto mt-2' : 'hidden'}
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
    </div>
  );
}
