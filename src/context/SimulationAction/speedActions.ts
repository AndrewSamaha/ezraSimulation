'use client';

import { SimulationState } from '../types';
import { SetSpeedAction } from './types';

export const handleSetSpeed = (
  state: SimulationState,
  action: SetSpeedAction,
): SimulationState => {
  return {
    ...state,
    speed: action.payload,
  };
};
