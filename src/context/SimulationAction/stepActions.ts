'use client';

import { SimulationState } from '../types';
import { NextStepAction, PreviousStepAction, GoToStepAction, SetSimulationStateAction } from './types';
import { calculateNextStep } from '@/lib/simulation/main';

export const handleNextStep = (
  state: SimulationState,
  action: NextStepAction
): SimulationState => {
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
    if (state.selectedObjectId && !action.preserveSelection) {
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
  action: PreviousStepAction
): SimulationState => {
  if (state.currentStep <= 0) {
    return state; // Already at the first step
  }

  // Move to the previous step, maintaining object selection if possible
  let updatedSelectedObjectId = state.selectedObjectId;

  // If there was a selected object, make sure it's still available in the previous step
  if (state.selectedObjectId) {
    const currentStep = state.steps[state.currentStep];
    const prevStep = state.steps[state.currentStep - 1];

    // Find the corresponding object in the previous step
    const selectedInCurStep = currentStep.objects.find(
      (obj) => obj.id === state.selectedObjectId,
    );

    // Try to find the object in the previous step
    // First by direct ID match
    let selectedInPrevStep = prevStep.objects.find(
      (obj) => obj.id === state.selectedObjectId,
    );

    // If not found and we have the current object, try to find by looking at child relationships
    if (!selectedInPrevStep && selectedInCurStep) {
      // Check if any object in the previous step is a parent of our selected object
      selectedInPrevStep = prevStep.objects.find(
        (obj) => selectedInCurStep.parentId === obj.id,
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
  action: GoToStepAction
): SimulationState => {
  const targetStep = Math.max(0, Math.min(action.payload, state.steps.length - 1));
  
  if (targetStep === state.currentStep) {
    return state; // Already at the target step
  }

  // Handle object selection when moving between steps
  let updatedSelectedObjectId = state.selectedObjectId;

  // If there was a selected object and we're not explicitly preserving selection,
  // attempt to find it in the target step
  if (state.selectedObjectId && !action.preserveSelection) {
    const currentStep = state.steps[state.currentStep];
    const targetStepData = state.steps[targetStep];
    
    const selectedInCurStep = currentStep.objects.find(
      (obj) => obj.id === state.selectedObjectId,
    );
    
    // Try to find the same object in the target step
    const selectedInTargetStep = targetStepData.objects.find(
      (obj) => obj.id === state.selectedObjectId,
    );
    
    if (selectedInTargetStep) {
      // Object found with the same ID
      updatedSelectedObjectId = selectedInTargetStep.id;
    } else {
      // If moving forward in time, check for descendants
      if (targetStep > state.currentStep && selectedInCurStep) {
        // Look for objects that have our selected object as a parent
        const descendants = targetStepData.objects.filter(
          (obj) => obj.parentId === state.selectedObjectId,
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
  action: SetSimulationStateAction
): SimulationState => {
  return {
    ...state,
    steps: [action.payload],
    currentStep: 0,
  };
};
