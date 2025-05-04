'use client';

import { SimulationState } from '../types';
import { AddObjectAction, UpdateObjectAction, RemoveObjectAction } from './types';

export const handleAddObject = (
  state: SimulationState,
  action: AddObjectAction
): SimulationState => {
  // We can only add objects to the current step
  if (state.currentStep === state.steps.length - 1) {
    // Get the current step
    const currentStep = state.steps[state.currentStep];
    
    // Create new step with the added object
    const newStep = {
      ...currentStep,
      objects: [...currentStep.objects, action.payload],
    };
    
    // Update the steps array
    const newSteps = [...state.steps];
    newSteps[state.currentStep] = newStep;
    
    return {
      ...state,
      steps: newSteps,
    };
  }
  
  return state; // Can't add objects to historical steps
};

export const handleUpdateObject = (
  state: SimulationState,
  action: UpdateObjectAction
): SimulationState => {
  // We can only update objects in the current step
  if (state.currentStep === state.steps.length - 1) {
    // Get the current step
    const currentStep = state.steps[state.currentStep];
    
    // Find and update the object
    const updatedObjects = currentStep.objects.map((obj) => 
      obj.id === action.payload.id ? action.payload : obj
    );
    
    // Create new step with updated objects
    const newStep = {
      ...currentStep,
      objects: updatedObjects,
    };
    
    // Update the steps array
    const newSteps = [...state.steps];
    newSteps[state.currentStep] = newStep;
    
    return {
      ...state,
      steps: newSteps,
    };
  }
  
  return state; // Can't update objects in historical steps
};

export const handleRemoveObject = (
  state: SimulationState,
  action: RemoveObjectAction
): SimulationState => {
  // We can only remove objects from the current step
  if (state.currentStep === state.steps.length - 1) {
    // Get the current step
    const currentStep = state.steps[state.currentStep];
    
    // Filter out the object to be removed
    const filteredObjects = currentStep.objects.filter(
      (obj) => obj.id !== action.payload
    );
    
    // Create new step without the removed object
    const newStep = {
      ...currentStep,
      objects: filteredObjects,
    };
    
    // Update the steps array
    const newSteps = [...state.steps];
    newSteps[state.currentStep] = newStep;
    
    // If the removed object was selected, deselect it
    const updatedSelectedObjectId = 
      state.selectedObjectId === action.payload ? null : state.selectedObjectId;
    
    return {
      ...state,
      steps: newSteps,
      selectedObjectId: updatedSelectedObjectId,
    };
  }
  
  return state; // Can't remove objects from historical steps
};
