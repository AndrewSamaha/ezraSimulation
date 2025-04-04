'use client';

import { useEffect, useRef } from 'react';
import styles from './simulation.module.css';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useSimulation, SimulationObject } from '@/context/SimulationContext';

export default function SimulationPage() {
  const { state, dispatch } = useSimulation();
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // No click handling as per requirements

  // Start the simulation
  const startSimulation = () => {
    if (!state.isRunning) {
      dispatch({ type: 'START_SIMULATION' });
      
      // Set velocity for the circle
      const mainCircle = state.steps[state.currentStep].objects.find(obj => obj.id === 'circle-1');
      if (mainCircle) {
        // No need to modify anything here now that the simulation works with velocity vectors
        const updatedCircle: SimulationObject = {
          ...mainCircle
        };
        dispatch({ type: 'UPDATE_OBJECT', payload: updatedCircle });
      }
      
      // Start interval to advance simulation steps
      intervalRef.current = setInterval(() => {
        dispatch({ type: 'NEXT_STEP' });
      }, state.speed);
    }
  };

  // Pause the simulation
  const pauseSimulation = () => {
    if (state.isRunning) {
      dispatch({ type: 'PAUSE_SIMULATION' });
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    }
  };

  // Reset the simulation
  const resetSimulation = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
    
    dispatch({ type: 'RESET_SIMULATION' });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up interval on unmount
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={styles.simulationContainer}
    >
      {/* Render all objects in the current simulation step */}
      {state.steps[state.currentStep].objects.map(obj => (
        <div key={obj.id}>
          <div 
            className={`${styles.circle} ${styles[obj.objectType]}`}
            style={{ 
              left: `${obj.vector.x}px`, 
              top: `${obj.vector.y}px`,
              backgroundColor: obj.objectType === 'animal' ? 'red' : (obj.color || 'green'),
              width: `${obj.size || 50}px`,
              height: `${obj.size || 50}px`
            }}
          />
          <div 
            className={styles.objectAnnotation}
            style={{ 
              left: `${obj.vector.x}px`, 
              top: `${obj.vector.y + (obj.size || 50) + 5}px`
            }}
          >
            <div>Type: {obj.objectType}</div>
            <div>Position: ({Math.round(obj.vector.x)}, {Math.round(obj.vector.y)})</div>
            <div>Direction: {Math.round(obj.velocity.angle() * (180/Math.PI))}°</div>
            <div>Speed: {Math.round(obj.velocity.length() * 100) / 100}</div>
          </div>
        </div>
      ))}
      
      <div className={styles.controlPanel}>
        <Button 
          onClick={startSimulation} 
          disabled={state.isRunning}
          className={styles.controlButton}
          variant="outline"
          size="icon"
        >
          <Play className="h-4 w-4" />
        </Button>
        <Button 
          onClick={pauseSimulation} 
          disabled={!state.isRunning}
          className={styles.controlButton}
          variant="outline"
          size="icon"
        >
          <Pause className="h-4 w-4" />
        </Button>
        <Button 
          onClick={resetSimulation} 
          className={styles.controlButton}
          variant="outline"
          size="icon"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
      
      <div className={styles.instructions}>
        {state.isRunning 
          ? 'Simulation running - use controls to pause or reset' 
          : 'Use the controls to start, pause, or reset the simulation'}
      </div>
      
      <div className={styles.stepInfo}>
        Step: {state.currentStep} / {state.steps.length - 1}
      </div>
    </div>
  );
}
