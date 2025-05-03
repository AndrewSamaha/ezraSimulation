'use client';

import { Card } from '@/components/ui/card';

export default function HistoryPage() {
  return (
    <div className="w-full h-screen bg-black bg-contain bg-no-repeat bg-center relative overflow-hidden">
      {/* Main content container with transition effect */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-transform duration-300 ease-in-out`}
      >
        <Card className="relative bg-gray-900 rounded-lg border border-white/10">
          this is a test
        </Card>
      </div>
    </div>
  );
}
