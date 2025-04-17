'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
  useState,
} from 'react';

import { calculateNextStep } from '@/lib/simulation/main';
import { createNewNutrience } from '@/lib/simulation/behavior/nutrience';
import { HERBIVORE_DNA_TEMPLATE, PLANT_DNA_TEMPLATE } from '@/lib/simulation/evolution/organism';
import { createNewOrganism } from '@/lib/simulation/behavior/organism/new';

import { v4 as uuid } from 'uuid';

import {
  SimulationObject,
  SimulationStep,
  PerformanceMetrics,
} from '@/lib/simulation/types/SimulationObject';

// Define the overall simulation state
export interface SimulationState {
  id: string;
  currentStep: number;
  steps: SimulationStep[];
  isRunning: boolean;
  speed: number; // Milliseconds between steps
  selectedObjectId: string | null; // Track selected object by ID
  performanceMetrics: PerformanceMetrics;
}

// Define available actions for the simulation
type SimulationAction =
  | { type: 'START_SIMULATION' }
  | { type: 'PAUSE_SIMULATION' }
  | { type: 'RESET_SIMULATION' }
  | { type: 'NEXT_STEP'; preserveSelection?: boolean }
  | { type: 'PREVIOUS_STEP' }
  | { type: 'GO_TO_STEP'; payload: number; preserveSelection?: boolean }
  | { type: 'SET_SPEED'; payload: number }
  | { type: 'UPDATE_OBJECT'; payload: SimulationObject }
  | { type: 'ADD_OBJECT'; payload: SimulationObject }
  | { type: 'REMOVE_OBJECT'; payload: string }
  | { type: 'SET_SIMULATION_STATE'; payload: SimulationStep }
  | { type: 'SELECT_OBJECT'; payload: string | null }
  | { type: 'INITIALIZE_STATE' };

// Empty initial state for server-side rendering
const emptyInitialState: SimulationState = {
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
};

// Function to create the actual initial state (only called on client-side)
const createInitialState = (): SimulationState => ({
  id: uuid(),
  currentStep: 0,
  steps: [
    {
      objects: [
        ...Array.from({ length: 5 }, () => createNewNutrience()),
        createNewOrganism(PLANT_DNA_TEMPLATE),
        ...Array.from({ length: 3 }, () => createNewOrganism(HERBIVORE_DNA_TEMPLATE)),
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
});

// Reducer function to handle state updates
function simulationReducer(state: SimulationState, action: SimulationAction): SimulationState {
  switch (action.type) {
    case 'SELECT_OBJECT':
      return {
        ...state,
        selectedObjectId: action.payload,
      };
    case 'START_SIMULATION':
      return { ...state, isRunning: true };

    case 'PAUSE_SIMULATION':
      return { ...state, isRunning: false };

    case 'RESET_SIMULATION':
      return createInitialState();

    case 'SET_SIMULATION_STATE': {
      return {
        ...state,
        steps: [action.payload],
        currentStep: 0,
      };
    }

    case 'NEXT_STEP': {
      // If we're at the last known step, we need to calculate the next step
      if (state.currentStep >= state.steps.length - 1) {
        // Calculate new positions based on vector movement and collisions
        // using our extracted physics logic
        const currentStep = state.steps[state.currentStep];
        const result = calculateNextStep(currentStep);
        const { step: newStep, metrics } = result;

        // Update performance metrics
        const now = performance.now();
        const frameTime = metrics?.frameDuration || 0;
        const organismCalcTimes = metrics?.organismCalculationTimes || [];
        const totalOrgCalcTime = organismCalcTimes.reduce((sum, time) => sum + time, 0);
        const avgOrgCalcTime =
          organismCalcTimes.length > 0 ? totalOrgCalcTime / organismCalcTimes.length : 0;

        // Calculate FPS based on last frame duration
        const fps = frameTime > 0 ? 1000 / frameTime : 0;

        // Limit history to last 30 frames
        const MAX_HISTORY = 30;
        const frameDurations = [frameTime, ...state.performanceMetrics.frameDurations].slice(
          0,
          MAX_HISTORY,
        );

        const organismCalculationTimes = [
          ...organismCalcTimes,
          ...state.performanceMetrics.organismCalculationTimes,
        ].slice(0, MAX_HISTORY);

        // Check if we need to update the selected object's ID in the new step
        let updatedSelectedObjectId = state.selectedObjectId;

        // If there was a selected object, make sure it's still available in the new step
        // and keep following it
        if (state.selectedObjectId) {
          // Find the object in the new step that matches the selected object
          const selectedInPrevStep = currentStep.objects.find(
            (obj) => obj.id === state.selectedObjectId,
          );
          const selectedInNewStep = newStep.objects.find((obj) => {
            // If we can find the selected object in the new step by ID, use it
            if (obj.id === state.selectedObjectId) return true;

            // If not, try to find it by parentId (in case it was reproduced/transformed)
            return selectedInPrevStep && obj.parentId === selectedInPrevStep.id;
          });

          // Update the selected object ID if found in the new step
          if (selectedInNewStep) {
            updatedSelectedObjectId = selectedInNewStep.id;
          }
        }

        return {
          ...state,
          steps: [...state.steps, newStep],
          currentStep: state.currentStep + 1,
          selectedObjectId: updatedSelectedObjectId, // Maintain selection across steps
          performanceMetrics: {
            ...state.performanceMetrics,
            lastFrameDuration: frameTime,
            frameDurations,
            fps,
            totalOrganismCalculationTime: totalOrgCalcTime,
            organismCalculationTimes,
            avgOrganismCalculationTime: avgOrgCalcTime,
            lastUpdateTimestamp: now,
          },
        };
      } else {
        // Just move to the next pre-calculated step, maintaining the selected object
        // Check if we need to update the selected object's ID in the next step
        let updatedSelectedObjectId = state.selectedObjectId;

        // If there was a selected object, make sure it's still available in the next step
        if (state.selectedObjectId) {
          const currentStep = state.steps[state.currentStep];
          const nextStep = state.steps[state.currentStep + 1];

          // Find the object in the next step that matches the selected object
          const selectedInCurStep = currentStep.objects.find(
            (obj) => obj.id === state.selectedObjectId,
          );
          const selectedInNextStep = nextStep.objects.find((obj) => {
            // If we can find the selected object in the next step by ID, use it
            if (obj.id === state.selectedObjectId) return true;

            // If not, try to find it by parentId (in case it was reproduced/transformed)
            return selectedInCurStep && obj.parentId === selectedInCurStep.id;
          });

          // Update the selected object ID if found in the next step
          if (selectedInNextStep) {
            updatedSelectedObjectId = selectedInNextStep.id;
          }
        }

        return {
          ...state,
          currentStep: state.currentStep + 1,
          selectedObjectId: updatedSelectedObjectId, // Maintain selection across steps
        };
      }
    }

    case 'PREVIOUS_STEP':
      return {
        ...state,
        currentStep: Math.max(0, state.currentStep - 1),
      };

    case 'GO_TO_STEP':
      return {
        ...state,
        currentStep: Math.min(Math.max(0, action.payload), state.steps.length - 1),
      };

    case 'SET_SPEED':
      return {
        ...state,
        speed: action.payload,
      };

    case 'UPDATE_OBJECT': {
      const currentStep = state.steps[state.currentStep];
      const updatedObjects = currentStep.objects.map((obj) =>
        obj.id === action.payload.id ? action.payload : obj,
      );

      const updatedSteps = [...state.steps];
      updatedSteps[state.currentStep] = {
        ...currentStep,
        objects: updatedObjects,
      };

      // Remove any future steps since we've modified the timeline
      const newSteps = updatedSteps.slice(0, state.currentStep + 1);

      return {
        ...state,
        steps: newSteps,
      };
    }

    case 'ADD_OBJECT': {
      const currentStep = state.steps[state.currentStep];
      const updatedObjects = [...currentStep.objects, action.payload];

      const updatedSteps = [...state.steps];
      updatedSteps[state.currentStep] = {
        ...currentStep,
        objects: updatedObjects,
      };

      // Remove any future steps since we've modified the timeline
      const newSteps = updatedSteps.slice(0, state.currentStep + 1);

      return {
        ...state,
        steps: newSteps,
      };
    }

    case 'REMOVE_OBJECT': {
      const currentStep = state.steps[state.currentStep];
      const updatedObjects = currentStep.objects.filter((obj) => obj.id !== action.payload);

      const updatedSteps = [...state.steps];
      updatedSteps[state.currentStep] = {
        ...currentStep,
        objects: updatedObjects,
      };

      // Remove any future steps since we've modified the timeline
      const newSteps = updatedSteps.slice(0, state.currentStep + 1);

      return {
        ...state,
        steps: newSteps,
      };
    }

    default:
      return state;
  }
}

// Create the context
const SimulationContext = createContext<{
  state: SimulationState;
  dispatch: React.Dispatch<SimulationAction>;
  isInitialized: boolean;
}>({
  state: emptyInitialState,
  dispatch: () => null,
  isInitialized: false,
});

// Provider component to wrap the app with
export function SimulationProvider({ children }: { children: ReactNode }) {
  // Start with empty state for SSR
  const [state, dispatch] = useReducer(simulationReducer, emptyInitialState);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize the simulation only on the client side
  useEffect(() => {
    // Only initialize once
    if (!isInitialized) {
      dispatch({
        type: 'SET_SIMULATION_STATE',
        payload: createInitialState().steps[0],
      });
      setIsInitialized(true);
    }
  }, [isInitialized]);

  return (
    <SimulationContext.Provider value={{ state, dispatch, isInitialized }}>
      {children}
    </SimulationContext.Provider>
  );
}

// Hook for components to use the simulation context
export function useSimulation() {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
}
