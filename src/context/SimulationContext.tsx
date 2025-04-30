'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
  useState,
  useCallback,
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
  // Save-related state
  lastSavedStep: number;
  isSaving: boolean;
  saveInterval: number; // How many steps to collect before saving
  saveQueue: number[]; // Queue of steps to save
  isSimulationSaved: boolean; // Track if simulation has been created on the server
  serverId?: string; // Server-generated ID, if different from client ID
  // Internal tracking state
  _lastAction?: SimulationAction;
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
  | { type: 'INITIALIZE_STATE' }
  | { type: 'SAVE_STEP_REQUESTED'; payload: number }
  | { type: 'SAVE_STEP_STARTED'; payload: number }
  | { type: 'SAVE_STEP_COMPLETED'; payload: number }
  | { type: 'SAVE_STEP_FAILED'; payload: { step: number; error: string } }
  | { type: 'SET_SAVE_INTERVAL'; payload: number }
  | { type: 'TRIGGER_SAVE_NOW' }
  | { type: 'SIMULATION_SAVED'; payload?: { serverId: string } };

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
  // Save-related state
  lastSavedStep: 0,
  isSaving: false,
  saveInterval: 50, // Save every 50 steps by default
  saveQueue: [],
  isSimulationSaved: false, // Initialize as not saved
  // serverId will be set when the simulation is first saved
};

// Function to create the actual initial state (only called on client-side)
const createInitialState = (): SimulationState => ({
  id: uuid(),
  currentStep: 0,
  steps: [
    {
      objects: [
        ...Array.from({ length: 50 }, () => createNewNutrience()),
        //createNewOrganism(PLANT_DNA_TEMPLATE),
        ...Array.from({ length: 50 }, () => createNewOrganism(HERBIVORE_DNA_TEMPLATE)),
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
  saveInterval: 50, // Save every 50 steps by default
  saveQueue: [],
  isSimulationSaved: false, // Initialize as not saved
});

// Save a simulation to the server
const saveSimulationToServer = async (simulationId: string, name: string = 'New Simulation') => {
  try {
    console.log('Creating simulation with ID:', simulationId);
    const response = await fetch('/api/simulations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: simulationId, // Pass the client-generated ID to the server
        name,
        config: {}, // Could add configuration options here
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error response from server:', errorData);
      throw new Error(`Failed to create simulation: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating simulation:', error);
    throw error;
  }
};

// Handle save step operation
const saveStepToServer = async (
  simulationId: string,
  stepNumber: number,
  stepData: SimulationStep,
  isSimulationSaved = false,
) => {
  try {
    let serverSimulationId = simulationId;
    let savedSimulation; // Declare this to return later

    // If simulation hasn't been saved to the server yet, save it first
    if (!isSimulationSaved) {
      console.log('Creating simulation on server before saving step...');
      savedSimulation = await saveSimulationToServer(simulationId);

      // Use the server-returned ID for all future operations
      if (savedSimulation.id) {
        if (savedSimulation.id !== simulationId) {
          console.log(`Using server-generated ID ${savedSimulation.id} instead of ${simulationId}`);
          // Store the server ID for future use
          serverSimulationId = savedSimulation.id;
        }
      } else {
        console.error('Server did not return a simulation ID');
        throw new Error('Server did not return a simulation ID');
      }
    }

    console.log(`Saving step ${stepNumber} for simulation ${serverSimulationId}`);
    const response = await fetch(`/api/simulations/${serverSimulationId}/steps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        simulationId: serverSimulationId,
        stepNumber,
        stepData,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Server error details:', errorData);
      throw new Error(`Failed to save step ${stepNumber}: ${response.statusText}`);
    }

    const result = await response.json();

    // If this was a first-time save, include the server simulation ID in the result
    if (!isSimulationSaved && savedSimulation) {
      return { ...result, simulationId: serverSimulationId };
    }

    return result;
  } catch (error) {
    console.error('Error saving simulation step:', error);
    throw error;
  }
};

// Reducer function to handle state updates
const simulationReducer = (state: SimulationState, action: SimulationAction): SimulationState => {
  // Store the last action for detecting specific actions in effects
  const newState = { ...state, _lastAction: action };
  switch (action.type) {
    case 'SELECT_OBJECT':
      return {
        ...newState,
        selectedObjectId: action.payload,
      };
    case 'START_SIMULATION':
      return { ...state, isRunning: true };

    case 'PAUSE_SIMULATION':
      return { ...state, isRunning: false };

    case 'RESET_SIMULATION': {
      // When resetting, we need to create a new simulation with a fresh ID
      const newState = createInitialState();
      // Clear any pending saves
      return {
        ...newState,
        saveQueue: [],
      };
    }

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

        const newStep = state.currentStep + 1;

        // Check if we need to queue this step for saving
        const updatedQueue = [...state.saveQueue]; // checked - not it
        if (newStep - state.lastSavedStep >= state.saveInterval) {
          // Add this step to the save queue if it's not already there
          if (!updatedQueue.includes(newStep)) {
            updatedQueue.push(newStep);
          }
        }

        return {
          ...state,
          currentStep: newStep,
          selectedObjectId: updatedSelectedObjectId, // Maintain selection across steps
          saveQueue: updatedQueue,
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

    // Save-related actions
    case 'SAVE_STEP_REQUESTED':
      console.log(`SAVE_STEP_REQUESTED: Adding step ${action.payload} to save queue`);
      return {
        ...state,
        saveQueue: [...state.saveQueue, action.payload],
      };

    case 'SAVE_STEP_STARTED':
      return {
        ...state,
        isSaving: true,
      };

    case 'SAVE_STEP_COMPLETED':
      return {
        ...state,
        isSaving: false,
        lastSavedStep: Math.max(state.lastSavedStep, action.payload),
        saveQueue: state.saveQueue.filter((step) => step !== action.payload),
      };

    case 'SAVE_STEP_FAILED':
      // We might want to retry later, so keep the step in the queue
      return {
        ...state,
        isSaving: false,
      };

    case 'SET_SAVE_INTERVAL':
      return {
        ...state,
        saveInterval: action.payload,
      };

    case 'TRIGGER_SAVE_NOW':
      // This action only triggers the side effect to save immediately
      // The actual state changes will happen through SAVE_STEP_STARTED, SAVE_STEP_COMPLETED etc.
      return newState;

    case 'SIMULATION_SAVED':
      return {
        ...state,
        isSimulationSaved: true,
        // If a server ID was provided, store it for future API calls
        ...(action.payload?.serverId ? { serverId: action.payload.serverId } : {}),
      };

    default:
      return newState;
  }
};

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

  // Process the save queue when not saving and queue has items
  const processSaveQueue = useCallback(async () => {
    if (state.saveQueue.length === 0 || state.isSaving) return;

    // Get the next step to save
    const nextToSave = state.saveQueue[0]; // This is a step number
    const stepData = state.steps[nextToSave];

    // Use the server ID if available, otherwise use the client ID
    const simulationId = state.serverId || state.id;
    console.log(`Processing save for step ${nextToSave} using simulation ID: ${simulationId}`);

    try {
      dispatch({ type: 'SAVE_STEP_STARTED', payload: nextToSave });

      // Pass the simulation saved state to saveStepToServer
      const result = await saveStepToServer(
        simulationId,
        nextToSave,
        stepData,
        state.isSimulationSaved,
      );

      // If this was the first successful save, mark the simulation as saved
      if (!state.isSimulationSaved) {
        // If server returned a different ID, store it
        if (result && result.simulationId && result.simulationId !== simulationId) {
          console.log(`Storing server-generated ID: ${result.simulationId}`);
          dispatch({
            type: 'SIMULATION_SAVED',
            payload: { serverId: result.simulationId },
          });
        } else {
          dispatch({ type: 'SIMULATION_SAVED' });
        }
      }

      dispatch({ type: 'SAVE_STEP_COMPLETED', payload: nextToSave });

      // Store in localStorage that this simulation was saved up to this step
      localStorage.setItem(`simulation_${state.id}_lastSaved`, nextToSave.toString());
    } catch (error) {
      console.error('Failed to save step:', error);
      dispatch({
        type: 'SAVE_STEP_FAILED',
        payload: {
          step: nextToSave,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }, [
    state.saveQueue,
    state.isSaving,
    state.id,
    state.steps,
    state.isSimulationSaved,
    state.serverId,
    dispatch,
  ]);

  // Process the save queue when not saving and queue has items
  // useEffect(() => {
  //   // Don't run on server
  //   if (typeof window === 'undefined') return;

  //   if (state.saveQueue.length > 0 && !state.isSaving) {
  //     processSaveQueue();
  //   }
  // }, [state.saveQueue, state.isSaving, state.id, state.isSimulationSaved, processSaveQueue]);

  // Handle manual save trigger
  const handleManualSave = useCallback(() => {
    // Add all unsaved steps to the queue
    const unsavedSteps = [];
    for (let i = state.lastSavedStep + 1; i <= state.currentStep; i++) {
      if (!state.saveQueue.includes(i)) {
        // Check if the step number is already in the queue
        if (i < state.steps.length) {
          unsavedSteps.push(i); // Just push the step number
        }
      }
    }

    if (unsavedSteps.length > 0) {
      console.log(`Adding ${unsavedSteps.length} unsaved steps to the queue`);
      // Add each step to the save queue
      for (const stepNumber of unsavedSteps) {
        dispatch({ type: 'SAVE_STEP_REQUESTED', payload: stepNumber });
      }
    }
  }, [state.lastSavedStep, state.currentStep, state.saveQueue, state.steps, dispatch]);

  // Watch for the TRIGGER_SAVE_NOW action
  useEffect(() => {
    const actionType = (state._lastAction as SimulationAction | undefined)?.type;
    if (actionType === 'TRIGGER_SAVE_NOW') {
      console.log('Manual save triggered');
      handleManualSave();
    }
  }, [state, handleManualSave]);

  // Process save queue whenever it changes
  useEffect(() => {
    if (isInitialized && state.saveQueue.length > 0 && !state.isSaving) {
      console.log(`Processing save queue with ${state.saveQueue.length} items`);
      void processSaveQueue();
    }
  }, [processSaveQueue, state.saveQueue, state.isSaving, isInitialized]);

  // Auto-save steps when reaching the save interval
  useEffect(() => {
    if (isInitialized && !state.isSaving) {
      // Check if we've reached the save interval
      const stepsSinceLastSave = state.currentStep - state.lastSavedStep;

      if (stepsSinceLastSave >= state.saveInterval) {
        // Add the current step to the save queue if not already there
        if (!state.saveQueue.includes(state.currentStep)) {
          if (state.currentStep < state.steps.length) {
            console.log(
              `Auto-saving step ${state.currentStep} (${stepsSinceLastSave} steps since last save)`,
            );
            dispatch({
              type: 'SAVE_STEP_REQUESTED',
              payload: state.currentStep, // Just pass the step number
            });
          }
        }
      }
    }
  }, [
    isInitialized,
    state.currentStep,
    state.lastSavedStep,
    state.saveInterval,
    state.isSaving,
    state.saveQueue,
    state.steps,
    dispatch,
  ]);

  // Check for unsaved steps when the component mounts
  useEffect(() => {
    if (isInitialized) {
      // Check localStorage for unsaved steps for this simulation
      const lastSaved = localStorage.getItem(`simulation_${state.id}_lastSaved`);
      if (lastSaved) {
        const lastSavedStep = parseInt(lastSaved, 10);
        if (!isNaN(lastSavedStep)) {
          // Update lastSavedStep in state
          if (lastSavedStep > state.lastSavedStep) {
            // Use direct dispatch to avoid stale state issues
            dispatch({ type: 'SAVE_STEP_COMPLETED', payload: lastSavedStep });
          }
        }
      }
    }
  }, [isInitialized, state.id]);

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
