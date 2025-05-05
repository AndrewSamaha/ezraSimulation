'use client';

import { SimulationAction } from './SimulationAction/types';
import { SimulationStep, PerformanceMetrics } from '@/lib/simulation/types/SimulationObject';

// Define the overall simulation state
export interface SimulationState {
  id: string;
  currentStep: number;
  steps: SimulationStep[];
  isRunning: boolean;
  speed: number; // Milliseconds between steps
  selectedObjectId: string | null; // Track selected object by ID
  performanceMetrics: PerformanceMetrics;
  // Save-related state
  lastSavedStep: number;
  isSaving: boolean;
  saveInterval: number; // How many steps to collect before saving
  saveQueue: number[]; // Queue of steps to save
  isSimulationSaved: boolean; // Track if simulation has been created on the server
  serverId?: string; // Server-generated ID, if different from client ID
  // Internal tracking state
  _lastAction?: SimulationAction;
  _stepOffset?: number; // Tracks how many steps have been trimmed from the beginning
}
