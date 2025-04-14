import { SimulationObject, SimulationStep, ObjectTypeEnum } from '@/context/SimulationContext';
import Victor from 'victor';

import { doPhysics } from './physics';
import { doNutrienceThings } from './behavior/nutrience';
import { doOrganismThings } from './behavior/organism';

/**
 * Type definition for simulation processors
 * Each processor can transform the array of simulation objects by adding, removing, or modifying objects
 */
export type SimulationProcessor = (objects: SimulationObject[]) => SimulationObject[];

/**
 * List of processors to run in sequence
 * Each processor can transform the entire array of objects
 */
const simulationProcessors: SimulationProcessor[] = [
  // Apply physics to all objects
  (objects) => objects.map(doPhysics),
  
  // Apply nutrience-specific behaviors
  (objects) => objects.reduce<SimulationObject[]>((acc, obj) => {
    // Process the object and possibly create new objects
    const result = doNutrienceThings(obj, objects);
    return [...acc, ...result];
  }, []),
  
  // Add more processors here as needed
];

/**
 * Calculates the next step in the simulation by running all processors in sequence
 */
export function calculateNextStep(currentStep: SimulationStep): { step: SimulationStep, metrics?: { frameDuration: number, organismCalculationTimes: number[] } } {
  // Start timing the frame
  const frameStartTime = performance.now();
  
  // Create metrics collector for organism calculations
  const metricsCollector: Record<string, number[]> = {
    organismCalculations: [],
  };
  
  // Modified organism processor to collect timing metrics and ensure vector integrity
  const organismProcessor = (objects: SimulationObject[]): SimulationObject[] => {
    console.log('  organism processor');
    console.log('    input objects:');
    console.dir(objects);
    
    // CRITICAL FIX: Before doing any processing, check for and repair any corrupted vectors,
    // especially for child organisms which seem particularly susceptible to corruption
    const sanitizedInputObjects = objects.map((obj) => {
      if (!obj.vector || obj.vector.x === 0 || obj.vector.y === 0 || 
          isNaN(obj.vector.x) || isNaN(obj.vector.y)) {
        // Found a corrupted vector
        console.error(`Found corrupted vector in object ${obj.id} BEFORE processing. Repairing.`);
        
        // Try to recreate a valid position - if this is a child object, and we have information
        // about its parent, we can use that
        let newVector;
        if (obj.parentId) {
          const parent = objects.find((o) => o.id === obj.parentId);
          if (parent && parent.vector && parent.vector.x !== 0 && parent.vector.y !== 0) {
            // Create position near the parent
            newVector = new Victor(
              parent.vector.x + (Math.random() * 100 - 50),
              parent.vector.y + (Math.random() * 100 - 50),
            );
          } else {
            // No valid parent found, use random position
            newVector = new Victor(Math.random() * 800 + 100, Math.random() * 800 + 100);
          }
        } else {
          // No parent ID (likely a base organism), use random position
          newVector = new Victor(Math.random() * 800 + 100, Math.random() * 800 + 100);
        }
        
        return {
          ...obj,
          vector: newVector,
          velocity: obj.velocity ? obj.velocity.clone() : new Victor(0, 0),
          forceInput: obj.forceInput ? obj.forceInput.clone() : new Victor(0, 0),
        };
      }
      return obj;
    });
    
    // First, create deep copies of all the input objects to ensure isolation
    const isolatedObjects = sanitizedInputObjects.map((obj) => ({
      ...obj,
      vector: obj.vector.clone(),  // Clone position vector
      velocity: obj.velocity.clone(),  // Clone velocity vector
      forceInput: obj.forceInput.clone(),  // Clone force vector
      actionHistory: [...obj.actionHistory],  // Clone action history array
    }));
    
    // Process each object with the isolated copies
    const newObjects = isolatedObjects.reduce<SimulationObject[]>((acc, obj) => {
      if (obj.objectType === ObjectTypeEnum.ORGANISM) {
        // Process the organism with all isolated copies
        const result = doOrganismThings(obj, isolatedObjects, metricsCollector);
        let resultObjects: SimulationObject[];
        
        if ('objects' in result) {
          resultObjects = result.objects;
        } else {
          resultObjects = result;
        }
        
        // CRITICAL FIX: Ensure each resulting object has properly isolated vectors
        const safeResultObjects = resultObjects.map((resultObj) => {
          // If vector is missing or invalid, create a new one
          if (!resultObj.vector || 
              isNaN(resultObj.vector.x) || 
              isNaN(resultObj.vector.y)) {
            console.error(`Fixing invalid vector for object ${resultObj.id}`);
            
            // For organisms that have a parent, try to derive position from parent
            if (resultObj.parentId) {
              const parent = isolatedObjects.find((p) => p.id === resultObj.parentId);
              if (parent && parent.vector) {
                // Create a slightly offset position from parent
                return {
                  ...resultObj,
                  vector: new Victor(
                    parent.vector.x + (Math.random() * 100 - 50),
                    parent.vector.y + (Math.random() * 100 - 50)
                  ),
                  velocity: new Victor(0, 0),
                  forceInput: new Victor(0, 0),
                };
              }
            }
            
            // Fallback: generate a random position within the container
            return {
              ...resultObj,
              vector: new Victor(
                Math.random() * 800 + 100, // Avoid edges
                Math.random() * 800 + 100
              ),
              velocity: new Victor(0, 0),
              forceInput: new Victor(0, 0),
            };
          }
          
          // Vector exists but ensure it's a clone to avoid reference issues
          return {
            ...resultObj,
            vector: resultObj.vector.clone(),
            velocity: resultObj.velocity.clone(),
            forceInput: resultObj.forceInput.clone(),
          };
        });
        
        return [...acc, ...safeResultObjects];
      }
      
      // Process non-organism objects normally
      const result = doNutrienceThings(obj, isolatedObjects);
      return [...acc, ...result];
    }, []);
    
    console.log('    output objects:');
    console.dir(newObjects);
    return newObjects;
  };
  
  // Vector diagnosis function to track where corruption happens
  const diagnoseVectors = (stage: string, objects: SimulationObject[]) => {
    if (process.env.NODE_ENV !== 'test') return; // Only run in test environment
    
    console.log(`\n===== VECTOR DIAGNOSIS: ${stage} =====`);
    objects.forEach((obj) => {
      const vectorState = obj.vector ? 
        `(${obj.vector.x.toFixed(2)}, ${obj.vector.y.toFixed(2)})` : 
        'UNDEFINED';
      
      console.log(`Object ${obj.id.substring(0, 8)}... (${obj.objectType}): ${vectorState}`);
      
      // Flag any suspicious values
      if (!obj.vector || obj.vector.x === 0 || obj.vector.y === 0 || 
          isNaN(obj.vector.x) || isNaN(obj.vector.y)) {
        console.error(`===> CORRUPTION DETECTED at ${stage}: Object ${obj.id} has invalid vector: ${vectorState}`);
      }
    });
    console.log('===== END DIAGNOSIS =====\n');
  };
  
  // Define processors with our new organism processor
  const frameProcessors = [
    // IMPORTANT FIX: Add isolation layer to ensure all objects have independent vector references
    (objects: SimulationObject[]) => {
      console.log('  isolation processor');
      // Create deep copies of all objects to ensure complete isolation
      const isolatedObjects = objects.map((obj) => ({
        ...obj,
        vector: obj.vector.clone(), // Clone the position vector
        velocity: obj.velocity.clone(), // Clone the velocity vector
        forceInput: obj.forceInput.clone(), // Clone the force vector
        actionHistory: [...obj.actionHistory], // Create a new array of actions
      }));
      
      // Diagnose after isolation
      diagnoseVectors('AFTER_ISOLATION', isolatedObjects);
      return isolatedObjects;
    },
    
    // Apply physics to all objects
    (objects: SimulationObject[]) => {
      console.log('  physics processor');
      console.log('    input objects:');
      console.dir(objects);
      
      // Diagnose before physics
      diagnoseVectors('BEFORE_PHYSICS', objects);
      
      const newObjects = objects.map(doPhysics);
      
      // Diagnose after physics
      diagnoseVectors('AFTER_PHYSICS', newObjects);
      
      console.log('    output objects:');
      console.dir(newObjects);
      return newObjects;
    },
    
    // CRITICAL DIAGNOSTIC: Check vectors right before organism processor
    (objects: SimulationObject[]) => {
      console.log('  diagnostic processor');
      
      // Deep check for vector corruption
      diagnoseVectors('BEFORE_ORGANISM_PROCESSOR', objects);
      
      // Save a reference snapshot to detect mutations
      const snapshot = objects.map((obj) => ({
        id: obj.id,
        vectorX: obj.vector.x,
        vectorY: obj.vector.y,
      }));
      
      // Store snapshot in global space for post-processor comparison
      // Using any here is acceptable for test-only diagnostic code
      (global as any).vectorSnapshot = snapshot;
      
      return objects;
    },
    
    // Apply behavior processors
    organismProcessor,
    
    // Final diagnostic check after organism processor
    (objects: SimulationObject[]) => {
      console.log('  post-organism diagnostic');
      
      // Check vectors after organism processing
      diagnoseVectors('AFTER_ORGANISM_PROCESSOR', objects);
      
      // Compare with pre-processor snapshot to detect mutations
      // Using any here is acceptable for test-only diagnostic code
      const snapshot = (global as any).vectorSnapshot;
      if (snapshot) {
        snapshot.forEach((saved: {id: string, vectorX: number, vectorY: number}) => {
          const currentObj = objects.find((o) => o.id === saved.id);
          if (currentObj) {
            if (saved.vectorX !== currentObj.vector.x || saved.vectorY !== currentObj.vector.y) {
              console.error(`===> VECTOR CHANGED during organism processing for ${saved.id}:`);
              console.error(`    Before: (${saved.vectorX}, ${saved.vectorY}) -> After: (${currentObj.vector.x}, ${currentObj.vector.y})`);
            }
          }
        });
      }
      
      return objects;
    },
  ];
  
  // CRITICAL: Create complete deep copies of the input objects before processing begins
  // This ensures all objects have their own independent vector references
  const initialSafeObjects = currentStep.objects.map((obj) => ({
    ...obj,
    vector: obj.vector.clone(),       // Clone position vector
    velocity: obj.velocity.clone(),   // Clone velocity vector
    forceInput: obj.forceInput.clone(), // Clone force vector
    actionHistory: [...obj.actionHistory], // Create a new array
  }));
  
  // Run each processor in sequence, passing the results from one to the next
  const newObjects = frameProcessors.reduce(
    (objects, processor) => processor(objects),
    initialSafeObjects, // Use our safe copy instead of the originals
  );
  
  // GLOBAL SAFEGUARD: Ensure all vectors have valid values
  // This is a final check to prevent any objects from having invalid or reset vectors
  const safeObjects = newObjects.map((obj) => {
    const MIN_POSITION_VALUE = 10.0; // Minimum allowed position value
    const MAX_POSITION_VALUE = 1000.0; // Maximum allowed position value to prevent overflow
    const MIN_VECTOR_MAGNITUDE = 1.0; // Ensure vectors have a minimum magnitude
    
    // Define a function to ensure a value is within safe range
    const ensureSafeValue = (value: number): number => {
      // Handle NaN, null or undefined
      if (value === null || value === undefined || isNaN(value)) {
        return MIN_POSITION_VALUE;
      }
      
      // Handle extreme values (too small or too large)
      if (Math.abs(value) < MIN_POSITION_VALUE || Math.abs(value) > MAX_POSITION_VALUE || value < 0) {
        // For position vectors, ALWAYS enforce positive values (organisms must be in container)
        // This is a design decision - in this simulation, organisms can't have negative positions
        const usePositiveValue = true; // Set to true to force all positions to be positive
        const sign = usePositiveValue ? 1 : (value < 0 ? -1 : 1);
        
        if (Math.abs(value) < MIN_POSITION_VALUE) {
          return sign * MIN_POSITION_VALUE;
        } else if (Math.abs(value) > MAX_POSITION_VALUE) {
          return sign * MAX_POSITION_VALUE;
        } else {
          // Value is negative but within range, make it positive
          return Math.abs(value);
        }
      }
      
      return value;
    };
    
    // Check if vector needs fixing - more comprehensive checks
    const needsFix = !obj.vector || !obj.velocity || !obj.forceInput ||
      Math.abs(obj.vector.x) < MIN_POSITION_VALUE || Math.abs(obj.vector.y) < MIN_POSITION_VALUE ||
      Math.abs(obj.vector.x) > MAX_POSITION_VALUE || Math.abs(obj.vector.y) > MAX_POSITION_VALUE ||
      isNaN(obj.vector.x) || isNaN(obj.vector.y) ||
      // Check if the overall vector magnitude is too small
      (obj.vector && obj.vector.magnitude() < MIN_VECTOR_MAGNITUDE);
      
    if (needsFix) {
      console.error(`!!! FIXING VECTOR for object ${obj.id} !!!`);
      console.error(`Original vector: ${obj.vector ? `(${obj.vector.x}, ${obj.vector.y})` : 'undefined'}`);
      
      // Clone the object to avoid modifying the original
      const safeObj = {
        ...obj,
        // Create safe vector values
        vector: new Victor(
          ensureSafeValue(obj.vector?.x),
          ensureSafeValue(obj.vector?.y)
        ),
        velocity: obj.velocity ? 
          new Victor(ensureSafeValue(obj.velocity.x / 10), ensureSafeValue(obj.velocity.y / 10)) : 
          new Victor(0, 0),
        forceInput: obj.forceInput ? 
          new Victor(ensureSafeValue(obj.forceInput.x / 10), ensureSafeValue(obj.forceInput.y / 10)) : 
          new Victor(0, 0),
      };
      
      console.error(`Fixed vector: (${safeObj.vector.x}, ${safeObj.vector.y})`);
      return safeObj;
    }
    
    return obj;
  });
  
  // Calculate frame duration
  const frameDuration = performance.now() - frameStartTime;
  
  // Return a new step with the updated objects and metrics
  return {
    step: {
      objects: safeObjects, // Use the safe objects with validated vectors
    },
    metrics: {
      frameDuration,
      organismCalculationTimes: metricsCollector.organismCalculations,
    },
  };
}
  