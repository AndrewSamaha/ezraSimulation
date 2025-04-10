import React, { ReactNode } from 'react';
import { SimulationContext } from '@/context/SimulationContext';

// Create a mock implementation of the simulation context for stories
export const SimulationContextMock = ({ children, selectedObjectId = null, initialObject = null }: {
  children: ReactNode;
  selectedObjectId?: string | null;
  initialObject?: any;
}) => {
  // Create a minimal mock state and dispatch function
  const mockState = {
    currentStep: 0,
    steps: [{
      objects: initialObject ? [initialObject] : [],
    }],
    isRunning: false,
    speed: 100,
    selectedObjectId,
    performanceMetrics: {
      lastFrameDuration: 0,
      frameDurations: [],
      fps: 0,
      totalOrganismCalculationTime: 0,
      organismCalculationTimes: [],
      avgOrganismCalculationTime: 0,
      lastUpdateTimestamp: 0,
    },
  };

  const mockDispatch = (action: any) => {
    console.log('Action dispatched:', action);
    // In a real implementation, this would update the state
  };

  return (
    <SimulationContext.Provider 
      value={{ 
        state: mockState, 
        dispatch: mockDispatch,
        isInitialized: true
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};
