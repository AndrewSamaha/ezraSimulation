'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import Link from 'next/link';

// Define the Simulation type based on our database schema
export type Simulation = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  lastStep: number;
  configuration: Record<string, unknown>;
};

export const columns: ColumnDef<Simulation>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <div className="px-1">
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
          aria-label="Select all"
          className="h-4 w-4 rounded-sm border-gray-300 focus:ring-blue-500"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="px-1" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(e.target.checked)}
          aria-label="Select row"
          className="h-4 w-4 rounded-sm border-gray-300 focus:ring-blue-500"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="text-white"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="text-left font-medium text-white">
          <Link
            href={`/simulation/history/${row.original.id}`}
            // className="text-blue-500 hover:text-blue-300 hover:underline"
          >
            {row.getValue('name') || `Simulation ${row.original.id.substring(0, 8)}`}
          </Link>
        </div>
      );
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
    accessorKey: 'lastStep',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="text-white"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Steps
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="text-center text-white">{row.getValue('lastStep') || 0}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return (
        <div className="flex justify-end space-x-2 text-white">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/simulation/history/${row.original.id}`}>Details</Link>
          </Button>
          {/* <Button variant="ghost" size="sm" asChild>
            <Link href={`/simulation/run?id=${row.original.id}`}>Open</Link>
          </Button> */}
        </div>
      );
    },
  },
];
