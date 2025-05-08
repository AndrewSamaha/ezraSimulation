'use client';

import { SimulationState } from '../types';
import { 
  SaveStepRequestedAction, 
  SaveStepStartedAction, 
  SaveStepCompletedAction,
  SaveStepFailedAction,
  SetSaveIntervalAction,
  TriggerSaveNowAction,
  SimulationSavedAction
} from './types';

export const handleSaveStepRequested = (
  state: SimulationState,
  action: SaveStepRequestedAction
): SimulationState => {
  // Add step to the save queue if not already there
  if (!state.saveQueue.includes(action.payload)) {
    return {
      ...state,
      saveQueue: [...state.saveQueue, action.payload],
    };
  }
  return state;
};

export const handleSaveStepStarted = (
  state: SimulationState,
  action: SaveStepStartedAction
): SimulationState => {
  return {
    ...state,
    isSaving: true,
  };
};

export const handleSaveStepCompleted = (
  state: SimulationState,
  action: SaveStepCompletedAction
): SimulationState => {
  // Remove the completed step from the queue and update lastSavedStep
  const newQueue = state.saveQueue.filter(step => step !== action.payload);
  
  // Update lastSavedStep to the highest saved step
  const newLastSavedStep = Math.max(state.lastSavedStep, action.payload);
  
  // Store in localStorage for recovery
  if (typeof window !== 'undefined') {
    localStorage.setItem(`simulation_${state.id}_lastSaved`, newLastSavedStep.toString());
  }
  
  return {
    ...state,
    saveQueue: newQueue,
    lastSavedStep: newLastSavedStep,
    isSaving: newQueue.length > 0, // Keep saving if there are more steps in queue
  };
};

export const handleSaveStepFailed = (
  state: SimulationState,
  action: SaveStepFailedAction
): SimulationState => {
  // Remove the failed step from the queue
  const newQueue = state.saveQueue.filter(step => step !== action.payload.step);
  
  console.error(`Failed to save step ${action.payload.step}: ${action.payload.error}`);
  
  return {
    ...state,
    saveQueue: newQueue,
    isSaving: newQueue.length > 0, // Keep saving if there are more steps in queue
  };
};

export const handleSetSaveInterval = (
  state: SimulationState,
  action: SetSaveIntervalAction
): SimulationState => {
  return {
    ...state,
    saveInterval: action.payload,
  };
};

export const handleTriggerSaveNow = (
  state: SimulationState,
  action: TriggerSaveNowAction
): SimulationState => {
  // This action just marks that a save was triggered manually
  // The actual queueing of steps happens in the useEffect
  return {
    ...state,
  };
};

export const handleSimulationSaved = (
  state: SimulationState,
  action: SimulationSavedAction
): SimulationState => {
  // Update the simulation as saved and store the server ID if provided
  const serverId = action.payload?.serverId || state.serverId;
  
  return {
    ...state,
    isSimulationSaved: true,
    serverId: serverId,
  };
};
