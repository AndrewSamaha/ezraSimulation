'use client';

import React, { createContext, useContext, useReducer, ReactNode, useEffect, useState } from 'react';
import Victor from 'victor';
import { calculateNextStep } from '@/lib/simulation/main';
import { createNewNutrience } from '@/lib/simulation/behavior/nutrience';

// Create an enum from the ObjectTypes
export enum ObjectTypeEnum {
  ORGANISM = 'organism',
  NUTRIENCE = 'nutrience'
}

// Define object types as an array of strings
const ObjectTypes = [ObjectTypeEnum.ORGANISM, ObjectTypeEnum.NUTRIENCE] as const;

// Create a TypeScript type from the ObjectTypes array
type ObjectType = typeof ObjectTypes[number];

// Define the shape of a simulation object
export interface SimulationObject {
  id: string;
  objectType: ObjectType;  // Required field for object type
  color?: string;
  size?: number;
  age: number;
  vector: Victor;    // Position vector
  velocity: Victor;  // Velocity vector (heading and speed)
  forceInput: Victor; // Force vector (for external forces)
  parentId: string | null;
}

// Define the shape of a simulation state at a specific step
export interface SimulationStep {
  objects: SimulationObject[];
}

// Define the overall simulation state
export interface SimulationState {
  currentStep: number;
  steps: SimulationStep[];
  isRunning: boolean;
  speed: number; // Milliseconds between steps
  selectedObjectId: string | null; // Track selected object by ID
}

// Define available actions for the simulation
type SimulationAction =
  | { type: 'START_SIMULATION' }
  | { type: 'PAUSE_SIMULATION' }
  | { type: 'RESET_SIMULATION' }
  | { type: 'NEXT_STEP' }
  | { type: 'PREVIOUS_STEP' }
  | { type: 'GO_TO_STEP', payload: number }
  | { type: 'SET_SPEED', payload: number }
  | { type: 'UPDATE_OBJECT', payload: SimulationObject }
  | { type: 'ADD_OBJECT', payload: SimulationObject }
  | { type: 'REMOVE_OBJECT', payload: string }
  | { type: 'SET_SIMULATION_STATE', payload: SimulationStep }
  | { type: 'SELECT_OBJECT', payload: string | null }
  | { type: 'INITIALIZE_STATE' };

// Empty initial state for server-side rendering
const emptyInitialState: SimulationState = {
  currentStep: 0,
  steps: [{ objects: [] }],
  isRunning: false,
  speed: 100,
  selectedObjectId: null
};

// Function to create the actual initial state (only called on client-side)
const createInitialState = (): SimulationState => ({
  currentStep: 0,
  steps: [
    {
      objects: [
        ...Array.from({ length: 5 }, () => createNewNutrience()),
        {
          id: 'circle-2',
          objectType: ObjectTypeEnum.ORGANISM,
          color: 'red',
          size: 25,
          age: 0,
          vector: new Victor(200, 200),   // Initial position
          velocity: new Victor(2, 1),      // Initial velocity
          forceInput: new Victor(0, 0),    // Initial force
          parentId: null
        }
      ]
    }
  ],
  isRunning: false,
  speed: 100,
  selectedObjectId: null
});

// Reducer function to handle state updates
function simulationReducer(state: SimulationState, action: SimulationAction): SimulationState {
  switch (action.type) {
    case 'SELECT_OBJECT':
      return {
        ...state,
        selectedObjectId: action.payload
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
        currentStep: 0
      };
    }

    case 'NEXT_STEP': {
      // If we're at the last known step, we need to calculate the next step
      if (state.currentStep >= state.steps.length - 1) {
        // Calculate new positions based on vector movement and collisions using our extracted physics logic
        const currentStep = state.steps[state.currentStep];
        const newStep = calculateNextStep(currentStep);
        
        return {
          ...state,
          steps: [...state.steps, newStep],
          currentStep: state.currentStep + 1
        };
      } else {
        // Just move to the next pre-calculated step
        return {
          ...state,
          currentStep: state.currentStep + 1
        };
      }
    }
    
    case 'PREVIOUS_STEP':
      return {
        ...state,
        currentStep: Math.max(0, state.currentStep - 1)
      };
    
    case 'GO_TO_STEP':
      return {
        ...state,
        currentStep: Math.min(Math.max(0, action.payload), state.steps.length - 1)
      };
    
    case 'SET_SPEED':
      return {
        ...state,
        speed: action.payload
      };
    
    case 'UPDATE_OBJECT': {
      const currentStep = state.steps[state.currentStep];
      const updatedObjects = currentStep.objects.map(obj => 
        obj.id === action.payload.id ? action.payload : obj
      );
      
      const updatedSteps = [...state.steps];
      updatedSteps[state.currentStep] = {
        ...currentStep,
        objects: updatedObjects
      };
      
      // Remove any future steps since we've modified the timeline
      const newSteps = updatedSteps.slice(0, state.currentStep + 1);
      
      return {
        ...state,
        steps: newSteps
      };
    }
    
    case 'ADD_OBJECT': {
      const currentStep = state.steps[state.currentStep];
      const updatedObjects = [...currentStep.objects, action.payload];
      
      const updatedSteps = [...state.steps];
      updatedSteps[state.currentStep] = {
        ...currentStep,
        objects: updatedObjects
      };
      
      // Remove any future steps since we've modified the timeline
      const newSteps = updatedSteps.slice(0, state.currentStep + 1);
      
      return {
        ...state,
        steps: newSteps
      };
    }
    
    case 'REMOVE_OBJECT': {
      const currentStep = state.steps[state.currentStep];
      const updatedObjects = currentStep.objects.filter(obj => obj.id !== action.payload);
      
      const updatedSteps = [...state.steps];
      updatedSteps[state.currentStep] = {
        ...currentStep,
        objects: updatedObjects
      };
      
      // Remove any future steps since we've modified the timeline
      const newSteps = updatedSteps.slice(0, state.currentStep + 1);
      
      return {
        ...state,
        steps: newSteps
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
  isInitialized: false 
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
        payload: createInitialState().steps[0] 
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
