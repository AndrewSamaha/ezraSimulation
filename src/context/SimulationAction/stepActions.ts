'use client';

import { SimulationState } from '../types';
import { NextStepAction, PreviousStepAction, GoToStepAction, SetSimulationStateAction } from './types';
import { calculateNextStep } from '@/lib/simulation/main';
import { MAX_STEPS_ON_CLIENT } from '@/lib/constants/context';
import { SimulationStep, SimulationObject } from '@/lib/simulation/types/SimulationObject';

// Helper function to get the correct index in the steps array accounting for any offset
function getStepIndex(state: SimulationState, absoluteStepNumber: number): number {
  // The absolute step number minus any steps that have been trimmed from the beginning
  return absoluteStepNumber - (state._stepOffset || 0);
}

// Helper function to get a step by its absolute step number
function getStepByNumber(state: SimulationState, absoluteStepNumber: number): SimulationStep | undefined {
  const index = getStepIndex(state, absoluteStepNumber);
  return index >= 0 && index < state.steps.length ? state.steps[index] : undefined;
}

export const handleNextStep = (
  state: SimulationState,
  action: NextStepAction,
): SimulationState => {
  // Check if we're at the last known step - we need the array index to check this
  const currentStepIndex = getStepIndex(state, state.currentStep);
  if (currentStepIndex >= state.steps.length - 1) {
    // Calculate new positions based on vector movement and collisions
    // using our extracted physics logic
    const currentStep = getStepByNumber(state, state.currentStep);
    
    // If we can't find the current step (which shouldn't happen), return the state
    if (!currentStep) {
      console.error('Could not find current step', state.currentStep);
      return state;
    }
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
    if (state.selectedObjectId && currentStep) {
      // Find the object in the new step that matches the selected object
      const selectedInPrevStep = currentStep.objects.find(
        (obj: { id: string }) => obj.id === state.selectedObjectId,
      );
      const selectedInNewStep = newStep.objects.find((obj: SimulationObject) => {
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

    // Add new step and trim steps array if it exceeds the maximum limit
    const updatedSteps = [...state.steps, newStep];
    const newCurrentStep = state.currentStep + 1; // Increment absolute step counter
    
    // If we need to trim the array, do it while preserving the absolute counter
    let trimmedSteps = updatedSteps;
    let stepOffset = 0; // Tracks how many steps we've removed from beginning
    
    if (updatedSteps.length > MAX_STEPS_ON_CLIENT) {
      stepOffset = updatedSteps.length - MAX_STEPS_ON_CLIENT;
      trimmedSteps = updatedSteps.slice(stepOffset);
    }
    
    return {
      ...state,
      steps: trimmedSteps,
      currentStep: newCurrentStep,
      // Store the step offset to maintain correct array indexing
      _stepOffset: (state._stepOffset || 0) + stepOffset,
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
    if (state.selectedObjectId && !action.preserveSelection) {
      const currentStep = getStepByNumber(state, state.currentStep);
      const nextStep = getStepByNumber(state, state.currentStep + 1);

      // Find the object in the next step that matches the selected object
      // Skip if currentStep or nextStep is undefined
      if (!currentStep || !nextStep) {
        return { ...state };
      }
      
      const selectedInCurStep = currentStep.objects.find(
        (obj: { id: string }) => obj.id === state.selectedObjectId,
      );
      const selectedInNextStep = nextStep.objects.find((obj: SimulationObject) => {
        // If we can find the selected object in the next step by ID, use it
        if (obj.id === state.selectedObjectId) return true;

        // If not, try to find it by parentId (in case it was reproduced/transformed)
        return selectedInCurStep && obj.parentId === selectedInCurStep.id;
      });

      // Update the selected object ID if found in the next step
      if (selectedInNextStep) {
        updatedSelectedObjectId = selectedInNextStep.id;
      } else {
        // If we can't find the object in the next step, deselect it
        updatedSelectedObjectId = null;
      }
    }

    return {
      ...state,
      currentStep: state.currentStep + 1,
      selectedObjectId: updatedSelectedObjectId,
    };
  }
};

export const handlePreviousStep = (
  state: SimulationState,
  action: PreviousStepAction,
): SimulationState => {
  // Verify we have the correct action type
  if (action.type !== 'PREVIOUS_STEP') {
    console.warn('Invalid action type for handlePreviousStep');
    return state;
  }
  if (state.currentStep <= 0) {
    return state; // Already at the first step
  }

  // Move to the previous step, maintaining object selection if possible
  let updatedSelectedObjectId = state.selectedObjectId;

  // If there was a selected object, make sure it's still available in the previous step
  if (state.selectedObjectId) {
    const currentStep = getStepByNumber(state, state.currentStep);
    const prevStep = getStepByNumber(state, state.currentStep - 1);

    // Find the corresponding object in the previous step
    // Skip if currentStep or prevStep is undefined
    if (!currentStep || !prevStep) {
      return { ...state };
    }
    
    const selectedInCurStep = currentStep.objects.find(
      (obj: { id: string }) => obj.id === state.selectedObjectId,
    );

    // Try to find the object in the previous step
    // First by direct ID match
    let selectedInPrevStep = prevStep.objects.find(
      (obj: { id: string }) => obj.id === state.selectedObjectId,
    );

    // If not found and we have the current object, try to find by looking at child relationships
    if (!selectedInPrevStep && selectedInCurStep) {
      // Check if any object in the previous step is a parent of our selected object
      selectedInPrevStep = prevStep.objects.find(
        (obj: { id: string }) => selectedInCurStep && selectedInCurStep.parentId === obj.id,
      );
    }

    // Update the selected object ID if found in the previous step
    if (selectedInPrevStep) {
      updatedSelectedObjectId = selectedInPrevStep.id;
    } else {
      // If we can't find the object in the previous step, deselect it
      updatedSelectedObjectId = null;
    }
  }

  return {
    ...state,
    currentStep: state.currentStep - 1,
    selectedObjectId: updatedSelectedObjectId,
  };
};

export const handleGoToStep = (
  state: SimulationState,
  action: GoToStepAction,
): SimulationState => {
  // Calculate the valid absolute step number (clamped to available steps)
  const maxStepIndex = state.steps.length - 1;
  const maxAbsoluteStep = maxStepIndex + (state._stepOffset || 0);
  const targetStep = Math.max(0, Math.min(action.payload, maxAbsoluteStep));
  
  if (targetStep === state.currentStep) {
    return state; // Already at the target step
  }

  // Handle object selection when moving between steps
  let updatedSelectedObjectId = state.selectedObjectId;

  // If there was a selected object and we're not explicitly preserving selection,
  // attempt to find it in the target step
  if (state.selectedObjectId && !action.preserveSelection) {
    const currentStep = getStepByNumber(state, state.currentStep);
    const targetStepData = getStepByNumber(state, targetStep);
    
    // Skip if currentStep or targetStepData is undefined
    if (!currentStep || !targetStepData) {
      return { ...state };
    }
    
    const selectedInCurStep = currentStep.objects.find(
      (obj: { id: string }) => obj.id === state.selectedObjectId,
    );
    
    // Try to find the same object in the target step
    const selectedInTargetStep = targetStepData.objects.find(
      (obj: { id: string }) => obj.id === state.selectedObjectId,
    );
    
    if (selectedInTargetStep) {
      // Object found with the same ID
      updatedSelectedObjectId = selectedInTargetStep.id;
    } else {
      // If moving forward in time, check for descendants
      if (targetStep > state.currentStep && selectedInCurStep) {
        // Look for objects that have our selected object as a parent
        const descendants = targetStepData.objects.filter(
          (obj: SimulationObject) => obj.parentId === state.selectedObjectId,
        );
        
        // If we found descendants, select the first one
        if (descendants.length > 0) {
          updatedSelectedObjectId = descendants[0].id;
        } else {
          // No descendants found, deselect
          updatedSelectedObjectId = null;
        }
      } else {
        // If moving backward in time or no direct match, deselect
        updatedSelectedObjectId = null;
      }
    }
  }

  return {
    ...state,
    currentStep: targetStep,
    selectedObjectId: updatedSelectedObjectId,
  };
};

export const handleSetSimulationState = (
  state: SimulationState,
  action: SetSimulationStateAction,
): SimulationState => {
  return {
    ...state,
    steps: [action.payload],
    currentStep: 0,
  };
};
