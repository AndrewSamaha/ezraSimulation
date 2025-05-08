'use client';

import { ColumnDef } from '@tanstack/react-table';
import { SimulationOrganism } from '../organisms-data-access';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';

export const organismColumns: ColumnDef<SimulationOrganism>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="text-white"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-mono text-sm truncate max-w-[200px]">
        {row.getValue('id')}
      </div>
    ),
  },
  {
    accessorKey: 'type',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="text-white"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'firstSeen',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="text-white"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          First Seen
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>Step {row.getValue('firstSeen')}</div>,
  },
  {
    accessorKey: 'lastSeen',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="text-white"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Last Seen
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div>Step {row.getValue('lastSeen')}</div>,
  },
  {
    accessorKey: 'occurrences',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="text-white"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Occurrences
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'position',
    header: 'Last Position',
    cell: ({ row }) => {
      const position = row.getValue('position') as { x: number; y: number } | undefined;
      return position ? (
        <div className="font-mono">
          ({position.x.toFixed(1)}, {position.y.toFixed(1)})
        </div>
      ) : (
        <div className="text-gray-400">N/A</div>
      );
    },
  },
  {
    accessorKey: 'energy',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="text-white"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Energy
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const energy = row.getValue('energy');
      return energy !== undefined ? (
        <div>{typeof energy === 'number' ? energy.toFixed(1) : energy}</div>
      ) : (
        <div className="text-gray-400">N/A</div>
      );
    },
  },
  {
    accessorKey: 'age',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="text-white"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Age
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const age = row.getValue('age');
      return age !== undefined ? (
        <div>{typeof age === 'number' ? age.toFixed(0) : age}</div>
      ) : (
        <div className="text-gray-400">N/A</div>
      );
    },
  },
  {
    accessorKey: 'color',
    header: 'Color',
    cell: ({ row }) => {
      const color = row.getValue('color') as string | undefined;
      return color ? (
        <div className="flex items-center space-x-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: color }}
          ></div>
          <span>{color}</span>
        </div>
      ) : (
        <div className="text-gray-400">N/A</div>
      );
    },
  },
];
