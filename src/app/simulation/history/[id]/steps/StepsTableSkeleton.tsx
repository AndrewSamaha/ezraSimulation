'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function StepsTableSkeleton() {
  // Generate 10 skeleton rows for the table
  const skeletonRows = Array.from({ length: 10 }, (_, i) => i);

  return (
    <div className="space-y-4">
      {/* Search input skeleton */}
      <div className="flex items-center justify-between py-4">
        <Skeleton className="h-10 w-64" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-md border border-white/10">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">
                <Skeleton className="h-4 w-14" />
              </TableHead>
              <TableHead className="w-32">
                <Skeleton className="h-4 w-24" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-40" />
              </TableHead>
              <TableHead className="text-right">
                <Skeleton className="h-4 w-20 ml-auto" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {skeletonRows.map((index) => (
              <TableRow key={index} className="animate-pulse">
                <TableCell>
                  <Skeleton className="h-4 w-8" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-52" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-16 ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between py-4">
        <Skeleton className="h-9 w-24" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}
