'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import Victor from 'victor';

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
  vector: Victor;    // Position vector
  velocity: Victor;  // Velocity vector (heading and speed)
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
        {
          id: 'circle-1',
          objectType: ObjectTypeEnum.PLANT,            // Using one of the defined object types
          color: 'green',
          size: 25,
          vector: new Victor(100, 100),   // Initial position
          velocity: new Victor(2, 1)      // Initial velocity
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
        // Calculate new positions based on vector movement and collisions
        const currentStep = state.steps[state.currentStep];
        const newObjects = currentStep.objects.map(obj => {
          // Clone the current position and velocity vectors to work with
          const position = obj.vector.clone();
          const velocity = obj.velocity.clone();
          
          // Apply forces here if needed (e.g., gravity, acceleration)
          // const forces = new Victor(0, 0.1); // Example gravity
          // velocity.add(forces); // Add forces to velocity
          
          // Apply movement: add velocity to position
          position.add(velocity);
          
          // Simple collision detection with boundaries (assuming container is 800x600)
          const containerWidth = 800;
          const containerHeight = 600;
          const radius = (obj.size || 50) / 2;
          
          // Check for boundary collisions and adjust velocity
          if (position.x - radius <= 0) {
            position.x = radius; // Prevent going out of bounds
            velocity.invertX(); // Bounce by reversing x velocity
          } else if (position.x + radius >= containerWidth) {
            position.x = containerWidth - radius; // Prevent going out of bounds
            velocity.invertX(); // Bounce by reversing x velocity
          }
          
          if (position.y - radius <= 0) {
            position.y = radius; // Prevent going out of bounds
            velocity.invertY(); // Bounce by reversing y velocity
          } else if (position.y + radius >= containerHeight) {
            position.y = containerHeight - radius; // Prevent going out of bounds
            velocity.invertY(); // Bounce by reversing y velocity
          }
          
          return {
            ...obj,
            vector: position,    // Update position
            velocity: velocity   // Update velocity
          };
        });
        
        const newStep: SimulationStep = {
          objects: newObjects
        };
        
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
