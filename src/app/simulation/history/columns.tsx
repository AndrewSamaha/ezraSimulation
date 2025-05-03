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
            href={`/simulation/run?id=${row.original.id}`}
            className="text-blue-500 hover:text-blue-300 hover:underline"
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
        <div className="flex justify-end text-white">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/simulation/run?id=${row.original.id}`}>Open</Link>
          </Button>
        </div>
      );
    },
  },
];
