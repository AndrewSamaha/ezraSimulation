import React from 'react';
import { useSimulation } from '@/context/SimulationContext';
import { Card } from '@/components/ui/card';

interface PerformancePanelProps {
  className?: string;
}

export const PerformancePanel: React.FC<PerformancePanelProps> = ({ className }) => {
  const { state } = useSimulation();
  const { performanceMetrics } = state;

  return (
    <Card className={`bg-black/80 rounded p-3 text-white text-xs overflow-hidden ${className}`}>
      <h3 className="text-sm font-semibold mb-2 border-b border-white/20 pb-1">
        Performance Metrics
      </h3>

      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Frame Rate:</span>
          <span className={performanceMetrics.fps < 20 ? 'text-red-400' : 'text-green-400'}>
            {performanceMetrics.fps.toFixed(1)} FPS
          </span>
        </div>

        <div className="flex justify-between">
          <span>Last Frame:</span>
          <span>{performanceMetrics.lastFrameDuration.toFixed(2)} ms</span>
        </div>

        <div className="flex justify-between">
          <span>Avg Organism Calc:</span>
          <span>{performanceMetrics.avgOrganismCalculationTime.toFixed(2)} ms</span>
        </div>

        <div className="flex justify-between">
          <span>Total Organism Time:</span>
          <span>{performanceMetrics.totalOrganismCalculationTime.toFixed(2)} ms</span>
        </div>
      </div>

      {/* Frame duration history visualization */}
      {performanceMetrics.frameDurations.length > 0 && (
        <div className="mt-3">
          <div className="text-xs mb-1">Frame Duration History</div>
          <div className="h-12 flex items-end">
            {performanceMetrics.frameDurations.slice(0, 20).map((duration, index) => {
              // Cap at 100ms for visualization purposes
              const height = Math.min((duration / 100) * 100, 100);
              return (
                <div
                  key={index}
                  className="w-1 mr-[1px] bg-blue-400"
                  style={{
                    height: `${height}%`,
                    backgroundColor: duration > 20 ? '#ef4444' : '#60a5fa',
                  }}
                />
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
};
