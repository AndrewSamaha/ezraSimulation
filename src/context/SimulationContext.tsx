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

// Import types and state management
import { SimulationState } from './types';
import { SimulationAction } from './SimulationAction/types';
import { simulationReducer } from './simulationReducer';
import { emptyInitialState } from './initialState';

// For saving to server
import { SimulationStep } from '@/lib/simulation/types/SimulationObject';

// Types now imported from './types' and './SimulationAction/types'

// Empty initial state and createInitialState are now imported from './initialState'

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

    // set working memory to empty array for simulationObjects
    const saveStepData = {
      objects: stepData.objects.map((obj) => ({
        ...obj,
        workingMemory: [],
      })),
    };

    const response = await fetch(`/api/simulations/${serverSimulationId}/steps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        simulationId: serverSimulationId,
        stepNumber,
        stepData: saveStepData,
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

// Create the context
const SimulationContext = createContext<{
  state: SimulationState;
  dispatch: React.Dispatch<SimulationAction>;
  isInitialized: boolean;
}>({
  state: emptyInitialState,
  dispatch() {
    throw new Error('dispatch function must be overridden');
  },
  isInitialized: false,
});

// Helper function to get step data by absolute step number, accounting for the offset
export function getStepByAbsoluteNumber(state: SimulationState, absoluteStepNumber: number): SimulationStep | undefined {
  const stepIndex = absoluteStepNumber - (state._stepOffset || 0);
  return stepIndex >= 0 && stepIndex < state.steps.length ? state.steps[stepIndex] : undefined;
}

// Provider component to wrap the app with
export function SimulationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(simulationReducer, emptyInitialState);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize state on client-side only
  useEffect(() => {
    // Don't run on server
    if (typeof window === 'undefined') return;

    // Check if we need to initialize the state
    if (!isInitialized) {
      dispatch({ type: 'INITIALIZE_STATE' });
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // API call to save a step to the server
  const processSaveQueue = useCallback(async () => {
    if (state.saveQueue.length === 0 || state.isSaving) {
      return;
    }

    const nextStepToSave = state.saveQueue[0];
    dispatch({ type: 'SAVE_STEP_STARTED', payload: nextStepToSave });

    try {
      // Get the step data using the helper function to account for any offset
      const stepData = getStepByAbsoluteNumber(state, nextStepToSave);
      
      // Check if the step data exists
      if (stepData) {
        console.log(`Processing step ${nextStepToSave} from save queue`);
        
        // Save the simulation if it's not already saved
        if (!state.isSimulationSaved) {
          try {
            console.log(`First saving simulation ${state.id} to server`);
            // Get the saved simulation with server ID
            const savedSimulation = await saveSimulationToServer(state.id);
            
            // Extract the server ID from the response
            const serverId = savedSimulation.id;
            
            // Update state with server ID
            dispatch({ 
              type: 'SIMULATION_SAVED', 
              payload: { serverId }, 
            });
            
            console.log(`Simulation saved with server ID: ${serverId}`);
          } catch (error) {
            console.error('Error saving simulation:', error);
            throw error; // Re-throw to be caught by outer catch
          }
        }

        // Now save the step
        console.log(`Saving step ${nextStepToSave} to server...`);
        
        // Use serverId if available, otherwise use client ID
        const simulationId = state.serverId || state.id;
        console.log(`Using simulation ID for step save: ${simulationId}`);
        
        // At this point state.isSimulationSaved should be true if we just saved the simulation
        const result = await saveStepToServer(simulationId, nextStepToSave, stepData, state.isSimulationSaved);
        
        // If the saveStepToServer returned a different simulation ID (which can happen on first save),
        // make sure we update our state
        if (result.simulationId && result.simulationId !== simulationId) {
          console.log(`Step save returned a different simulation ID: ${result.simulationId}`);
          dispatch({ 
            type: 'SIMULATION_SAVED', 
            payload: { serverId: result.simulationId },
          });
        }

        // Mark as saved
        dispatch({ type: 'SAVE_STEP_COMPLETED', payload: nextStepToSave });

        console.log(`Step ${nextStepToSave} saved successfully`);

        // Check if there are more steps to save
        if (state.saveQueue.length > 1) {
          // Process the next step in the queue after a short delay
          setTimeout(() => void processSaveQueue(), 100);
        }
      } else {
        // Invalid step number
        dispatch({
          type: 'SAVE_STEP_FAILED',
          payload: { step: nextStepToSave, error: 'Invalid step number' },
        });
      }
    } catch (error) {
      console.error('Error saving step:', error);
      dispatch({
        type: 'SAVE_STEP_FAILED',
        payload: { step: nextStepToSave, error: String(error) },
      });
    }
  }, [
    state,
    dispatch,
  ]);

  // Handle manual save trigger
  const handleManualSave = useCallback(() => {
    // Add all unsaved steps to the queue
    const unsavedSteps = [];
    for (let i = state.lastSavedStep + 1; i <= state.currentStep; i++) {
      if (!state.saveQueue.includes(i)) {
        // Check if the step number is already in the queue
        // Use the helper function to get step data by absolute number
      const stepData = getStepByAbsoluteNumber(state, i);
      if (stepData) {
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
  }, [state, dispatch]);

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
          // Use the helper function to get step data by absolute number
          const stepData = getStepByAbsoluteNumber(state, state.currentStep);
          if (stepData) {
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
    state,
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
  }, [isInitialized, state.id, state.lastSavedStep, dispatch]);

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
