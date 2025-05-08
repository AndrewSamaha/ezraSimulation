'use client';

import { SimulationState } from '../types';
import { SelectObjectAction } from './types';

export const handleSelectObject = (
  state: SimulationState,
  action: SelectObjectAction
): SimulationState => {
  return {
    ...state,
    selectedObjectId: action.payload,
  };
};
