'use client';

import { SimulationState } from '../types';
import { StartSimulationAction, PauseSimulationAction, ResetSimulationAction } from './types';
import { createInitialState } from '../initialState';

export const handleStartSimulation = (
  state: SimulationState,
  action: StartSimulationAction
): SimulationState => {
  return { ...state, isRunning: true };
};

export const handlePauseSimulation = (
  state: SimulationState,
  action: PauseSimulationAction
): SimulationState => {
  return { ...state, isRunning: false };
};

export const handleResetSimulation = (
  state: SimulationState,
  action: ResetSimulationAction
): SimulationState => {
  // When resetting, we need to create a new simulation with a fresh ID
  const newState = createInitialState();
  // Clear any pending saves
  return {
    ...newState,
    saveQueue: [],
  };
};
