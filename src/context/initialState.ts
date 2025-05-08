'use client';

import { v4 as uuid } from 'uuid';
import { SimulationState } from './types';
import { createNewNutrience } from '@/lib/simulation/behavior/nutrience';
import { HERBIVORE_DNA_TEMPLATE, PLANT_DNA_TEMPLATE } from '@/lib/simulation/evolution/organism';
import { createNewOrganism } from '@/lib/simulation/behavior/organism/new';

// Empty initial state for server-side rendering
export const emptyInitialState: SimulationState = {
  id: uuid(),
  currentStep: 0,
  steps: [{ objects: [] }],
  isRunning: false,
  speed: 100,
  selectedObjectId: null,
  performanceMetrics: {
    lastFrameDuration: 0,
    frameDurations: [],
    fps: 0,
    totalOrganismCalculationTime: 0,
    organismCalculationTimes: [],
    avgOrganismCalculationTime: 0,
    lastUpdateTimestamp: performance.now(),
  },
  // Save-related state
  lastSavedStep: 0,
  isSaving: false,
  saveInterval: 100, // Save every 100 steps by default
  saveQueue: [],
  isSimulationSaved: false, // Initialize as not saved
  // serverId will be set when the simulation is first saved
  _stepOffset: 0,
};

// Function to create the actual initial state (only called on client-side)
export const createInitialState = (): SimulationState => ({
  id: uuid(),
  currentStep: 0,
  steps: [
    {
      objects: [
        ...Array.from({ length: 50 }, () => createNewNutrience()),
        //createNewOrganism(PLANT_DNA_TEMPLATE),
        ...Array.from({ length: 25 }, () => createNewOrganism(HERBIVORE_DNA_TEMPLATE)),
      ],
    },
  ],
  isRunning: false,
  speed: 100,
  selectedObjectId: null,
  performanceMetrics: {
    lastFrameDuration: 0,
    frameDurations: [],
    fps: 0,
    totalOrganismCalculationTime: 0,
    organismCalculationTimes: [],
    avgOrganismCalculationTime: 0,
    lastUpdateTimestamp: performance.now(),
  },
  // Save-related state
  lastSavedStep: 0,
  isSaving: false,
  saveInterval: 100, // Save every 100 steps by default
  saveQueue: [],
  isSimulationSaved: false, // Initialize as not saved
  _stepOffset: 0,
});
