'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import Victor from 'victor';
import { calculateNextStep } from '@/lib/simulation/main';
import { createNewPlant } from '@/lib/simulation/behavior/plant';

// Create an enum from the ObjectTypes
export enum ObjectTypeEnum {
  ANIMAL = 'animal',
  PLANT = 'plant'
}

// Define object types as an array of strings
const ObjectTypes = [ObjectTypeEnum.ANIMAL, ObjectTypeEnum.PLANT] as const;

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
  | { type: 'SET_SIMULATION_STATE', payload: SimulationStep };

// Initial state for the simulation
const initialState: SimulationState = {
  currentStep: 0,
  steps: [
    {
      objects: [
        ...Array.from({ length: 5 }, () => createNewPlant()),
        {
          id: 'circle-2',
          objectType: ObjectTypeEnum.ANIMAL,            // Using one of the defined object types
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
  speed: 100
};

// Reducer function to handle state updates
function simulationReducer(state: SimulationState, action: SimulationAction): SimulationState {
  switch (action.type) {
    case 'START_SIMULATION':
      return { ...state, isRunning: true };
    
    case 'PAUSE_SIMULATION':
      return { ...state, isRunning: false };
    
    case 'RESET_SIMULATION':
      return { ...initialState };
    
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
    
    case 'SET_SIMULATION_STATE': {
      const updatedSteps = [...state.steps];
      updatedSteps[state.currentStep] = action.payload;
      
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

// Create the simulation context
interface SimulationContextProps {
  state: SimulationState;
  dispatch: React.Dispatch<SimulationAction>;
}

const SimulationContext = createContext<SimulationContextProps | undefined>(undefined);

// Provider component
interface SimulationProviderProps {
  children: ReactNode;
}

export function SimulationProvider({ children }: SimulationProviderProps) {
  const [state, dispatch] = useReducer(simulationReducer, initialState);
  
  const value = { state, dispatch };
  
  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
}

// Custom hook to use the simulation context
export function useSimulation() {
  const context = useContext(SimulationContext);
  
  if (context === undefined) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  
  return context;
}
