'use client';

import { SimulationObject, SimulationStep } from '@/lib/simulation/types/SimulationObject';

// All possible simulation actions
export type SimulationAction =
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

// Export specific action types for type safety
export type StartSimulationAction = Extract<SimulationAction, { type: 'START_SIMULATION' }>;
export type PauseSimulationAction = Extract<SimulationAction, { type: 'PAUSE_SIMULATION' }>;
export type ResetSimulationAction = Extract<SimulationAction, { type: 'RESET_SIMULATION' }>;
export type NextStepAction = Extract<SimulationAction, { type: 'NEXT_STEP' }>;
export type PreviousStepAction = Extract<SimulationAction, { type: 'PREVIOUS_STEP' }>;
export type GoToStepAction = Extract<SimulationAction, { type: 'GO_TO_STEP' }>;
export type SetSpeedAction = Extract<SimulationAction, { type: 'SET_SPEED' }>;
export type UpdateObjectAction = Extract<SimulationAction, { type: 'UPDATE_OBJECT' }>;
export type AddObjectAction = Extract<SimulationAction, { type: 'ADD_OBJECT' }>;
export type RemoveObjectAction = Extract<SimulationAction, { type: 'REMOVE_OBJECT' }>;
export type SetSimulationStateAction = Extract<SimulationAction, { type: 'SET_SIMULATION_STATE' }>;
export type SelectObjectAction = Extract<SimulationAction, { type: 'SELECT_OBJECT' }>;
export type InitializeStateAction = Extract<SimulationAction, { type: 'INITIALIZE_STATE' }>;
export type SaveStepRequestedAction = Extract<SimulationAction, { type: 'SAVE_STEP_REQUESTED' }>;
export type SaveStepStartedAction = Extract<SimulationAction, { type: 'SAVE_STEP_STARTED' }>;
export type SaveStepCompletedAction = Extract<SimulationAction, { type: 'SAVE_STEP_COMPLETED' }>;
export type SaveStepFailedAction = Extract<SimulationAction, { type: 'SAVE_STEP_FAILED' }>;
export type SetSaveIntervalAction = Extract<SimulationAction, { type: 'SET_SAVE_INTERVAL' }>;
export type TriggerSaveNowAction = Extract<SimulationAction, { type: 'TRIGGER_SAVE_NOW' }>;
export type SimulationSavedAction = Extract<SimulationAction, { type: 'SIMULATION_SAVED' }>;
