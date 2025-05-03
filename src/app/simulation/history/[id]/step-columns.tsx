'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { SimulationStep } from '../steps-data-access';

export const stepColumns: ColumnDef<SimulationStep>[] = [
  {
    accessorKey: 'stepNumber',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="text-white"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Step #
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="text-center text-white">{row.getValue('stepNumber')}</div>;
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="text-white"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as Date;
      return <div className="text-white">{date ? format(new Date(date), 'PPp') : 'N/A'}</div>;
    },
  },
  {
    id: 'data',
    header: () => <div className="text-white">Data Preview</div>,
    cell: ({ row }) => {
      const stepData = row.original.stepData;
      // Create a simplified preview of step data
      const dataKeys = Object.keys(stepData || {}).slice(0, 3);
      return (
        <div className="text-white max-w-md truncate">
          {dataKeys.length > 0
            ? dataKeys.map((key) => `${key}: ${JSON.stringify(stepData[key]).substring(0, 20)}...`).join(', ')
            : 'No data'}
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return (
        <div className="flex justify-end text-white">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              const detailElement = document.getElementById(`step-${row.original.stepNumber}-detail`);
              if (detailElement) {
                // Toggle visibility
                const isHidden = detailElement.classList.contains('hidden');
                if (isHidden) {
                  detailElement.classList.remove('hidden');
                } else {
                  detailElement.classList.add('hidden');
                }
              }
            }}
          >
            View Details
          </Button>
        </div>
      );
    },
  },
];
