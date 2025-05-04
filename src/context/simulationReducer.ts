'use client';

import { SimulationState } from './types';
import { SimulationAction } from './SimulationAction/types';
import {
  handleSelectObject,
  handleStartSimulation,
  handlePauseSimulation,
  handleResetSimulation,
  handleNextStep,
  handlePreviousStep,
  handleGoToStep,
  handleSetSimulationState,
  handleAddObject,
  handleUpdateObject,
  handleRemoveObject,
  handleSaveStepRequested,
  handleSaveStepStarted,
  handleSaveStepCompleted,
  handleSaveStepFailed,
  handleSetSaveInterval,
  handleTriggerSaveNow,
  handleSimulationSaved,
  handleSetSpeed,
} from './SimulationAction';

// Reducer function to handle state updates
export const simulationReducer = (
  state: SimulationState,
  action: SimulationAction,
): SimulationState => {
  // Store the last action for detecting specific actions in effects
  const newState = { ...state, _lastAction: action };

  switch (action.type) {
    case 'SELECT_OBJECT':
      return handleSelectObject(newState, action);

    case 'START_SIMULATION':
      return handleStartSimulation(newState, action);

    case 'PAUSE_SIMULATION':
      return handlePauseSimulation(newState, action);

    case 'RESET_SIMULATION':
      return handleResetSimulation(newState, action);

    case 'NEXT_STEP':
      return handleNextStep(newState, action);

    case 'PREVIOUS_STEP':
      return handlePreviousStep(newState, action);

    case 'GO_TO_STEP':
      return handleGoToStep(newState, action);

    case 'SET_SPEED':
      return handleSetSpeed(newState, action);

    case 'UPDATE_OBJECT':
      return handleUpdateObject(newState, action);

    case 'ADD_OBJECT':
      return handleAddObject(newState, action);

    case 'REMOVE_OBJECT':
      return handleRemoveObject(newState, action);

    case 'SET_SIMULATION_STATE':
      return handleSetSimulationState(newState, action);

    case 'SAVE_STEP_REQUESTED':
      return handleSaveStepRequested(newState, action);

    case 'SAVE_STEP_STARTED':
      return handleSaveStepStarted(newState, action);

    case 'SAVE_STEP_COMPLETED':
      return handleSaveStepCompleted(newState, action);

    case 'SAVE_STEP_FAILED':
      return handleSaveStepFailed(newState, action);

    case 'SET_SAVE_INTERVAL':
      return handleSetSaveInterval(newState, action);

    case 'TRIGGER_SAVE_NOW':
      return handleTriggerSaveNow(newState, action);

    case 'SIMULATION_SAVED':
      return handleSimulationSaved(newState, action);

    case 'INITIALIZE_STATE':
      // Return a fresh initial state
      return { ...createInitialState(), _lastAction: action };

    default:
      console.warn(`Unhandled action type: ${(action as any).type}`);
      return state;
  }
};

// Import here to avoid circular dependencies
import { createInitialState } from './initialState';
