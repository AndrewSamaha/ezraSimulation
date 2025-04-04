'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './simulation.module.css';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

export default function SimulationPage() {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isRunning, setIsRunning] = useState(false);
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  // Handle click to move the circle
  const handleClick = (e: React.MouseEvent) => {
    // if (containerRef.current && !isRunning) {
    //   const rect = containerRef.current.getBoundingClientRect();
    //   setPosition({
    //     x: e.clientX - rect.left,
    //     y: e.clientY - rect.top
    //   });
    // }
  };

  // Start the simulation
  const startSimulation = () => {
    if (!isRunning) {
      setIsRunning(true);
      setVelocity({ x: 2, y: 1 });
      animationRef.current = requestAnimationFrame(updateSimulation);
    }
  };

  // Pause the simulation
  const pauseSimulation = () => {
    if (isRunning) {
      setIsRunning(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  };

  // Reset the simulation
  const resetSimulation = () => {
    setIsRunning(false);
    setPosition({ x: 100, y: 100 });
    setVelocity({ x: 0, y: 0 });
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  // Update simulation frame
  const updateSimulation = () => {
    setPosition(prev => {
      const newX = prev.x + velocity.x;
      const newY = prev.y + velocity.y;
      
      // Check for collisions with container bounds
      let newVelX = velocity.x;
      let newVelY = velocity.y;
      
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const circleRadius = 25; // Half of the circle width
        
        if (newX - circleRadius <= 0 || newX + circleRadius >= rect.width) {
          newVelX = -newVelX;
        }
        
        if (newY - circleRadius <= 0 || newY + circleRadius >= rect.height) {
          newVelY = -newVelY;
        }
      }
      
      setVelocity({ x: newVelX, y: newVelY });
      
      return {
        x: newX,
        y: newY
      };
    });
    
    if (isRunning) {
      animationRef.current = requestAnimationFrame(updateSimulation);
    }
  };

  // Handle keyboard movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isRunning) {
        setPosition(prev => {
          const step = 10;
          switch (e.key) {
            case 'ArrowUp':
              return { ...prev, y: Math.max(0, prev.y - step) };
            case 'ArrowDown':
              return { ...prev, y: prev.y + step };
            case 'ArrowLeft':
              return { ...prev, x: Math.max(0, prev.x - step) };
            case 'ArrowRight':
              return { ...prev, x: prev.x + step };
            default:
              return prev;
          }
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // Clean up animation frame on unmount
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning]);

  return (
    <div 
      ref={containerRef}
      className={styles.simulationContainer} 
      onClick={handleClick}
    >
      <div 
        className={styles.circle}
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px` 
        }}
      />
      <div className={styles.controlPanel}>
        <Button 
          onClick={startSimulation} 
          disabled={isRunning}
          className={styles.controlButton}
          variant="outline"
          size="icon"
        >
          <Play className="h-4 w-4" />
        </Button>
        <Button 
          onClick={pauseSimulation} 
          disabled={!isRunning}
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
        {isRunning 
          ? 'Simulation running - use controls to pause or reset' 
          : 'Click anywhere to position the circle or use arrow keys'}
      </div>
    </div>
  );
}
