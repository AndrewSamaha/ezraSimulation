import { SimulationObject } from '@/context/SimulationContext';
import { CONTAINER_WIDTH, CONTAINER_HEIGHT, FRICTION } from '@/lib/constants/world';
import Victor from 'victor';

/**
 * Calculates the next position and velocity for a simulation object based on physics
 */
export function doPhysics(obj: SimulationObject): SimulationObject {
  // Clone the current position and velocity vectors to work with
  let position = obj.vector.clone();
  let velocity = obj.velocity.clone();

  // Apply forces here if needed (e.g., gravity, acceleration)
  // const forces = new Victor(0, 0.1); // Example gravity
  // velocity.add(forces); // Add forces to velocity
  // Apply friction
  velocity = velocity.multiply(FRICTION);

  // Apply force input
  velocity = velocity.add(obj.forceInput);

  // Apply movement: add velocity to position
  const newPosition = position.add(velocity);
  position = newPosition;

  // Get object radius for collision detection
  const radius = (obj.size || 50) / 2;

  // Check for boundary collisions and adjust velocity
  if (position.x - radius <= 0) {
    position.x = radius; // Prevent going out of bounds
    velocity = velocity.invertX(); // Bounce by reversing x velocity
  } else if (position.x + radius >= CONTAINER_WIDTH) {
    position.x = CONTAINER_WIDTH - radius; // Prevent going out of bounds
    velocity = velocity.invertX(); // Bounce by reversing x velocity
  }

  if (position.y - radius <= 0) {
    position.y = radius; // Prevent going out of bounds
    velocity = velocity.invertY(); // Bounce by reversing y velocity
  } else if (position.y + radius >= CONTAINER_HEIGHT) {
    position.y = CONTAINER_HEIGHT - radius; // Prevent going out of bounds
    velocity = velocity.invertY(); // Bounce by reversing y velocity
  }
  // Create a new force input vector
  const forceInput = new Victor(0, 0);

  // IMPORTANT: Clone the position vector to avoid reference issues
  // The issue was likely caused by not properly isolating vector references
  // between the original object and the updated object
  const vector = position.clone();

  // SAFEGUARD: Make sure vector values are never extremely close to zero
  // This prevents the issue where vectors somehow get reset to near-zero values
  const MIN_POSITION_VALUE = 1.0; // Minimum allowed position value
  if (Math.abs(vector.x) < MIN_POSITION_VALUE) {
    vector.x = vector.x < 0 ? -MIN_POSITION_VALUE : MIN_POSITION_VALUE;
  }
  if (Math.abs(vector.y) < MIN_POSITION_VALUE) {
    vector.y = vector.y < 0 ? -MIN_POSITION_VALUE : MIN_POSITION_VALUE;
  }

  // Create a completely new object instead of using spread operator on the original
  // This ensures we don't carry over any unexpected behaviors from the original object
  const updatedObject: SimulationObject = {
    ...obj,
    age: obj.age + 1,
    vector: vector, // Use the cloned vector
    velocity: velocity.clone(), // Clone the velocity vector
    forceInput: forceInput, // Use the new force input vector
  };

  return updatedObject;
}
