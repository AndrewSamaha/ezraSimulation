import { SimulationObject } from '@/context/SimulationContext';
import { CONTAINER_WIDTH, CONTAINER_HEIGHT } from '@/lib/constants/world';


/**
 * Calculates the next position and velocity for a simulation object based on physics
 */
export function doPhysics(obj: SimulationObject): SimulationObject {
  // Clone the current position and velocity vectors to work with
  const position = obj.vector.clone();
  const velocity = obj.velocity.clone();
  
  // Apply forces here if needed (e.g., gravity, acceleration)
  // const forces = new Victor(0, 0.1); // Example gravity
  // velocity.add(forces); // Add forces to velocity
  
  // Apply movement: add velocity to position
  position.add(velocity);
  
  // Get object radius for collision detection
  const radius = (obj.size || 50) / 2;
  
  // Check for boundary collisions and adjust velocity
  if (position.x - radius <= 0) {
    position.x = radius; // Prevent going out of bounds
    velocity.invertX(); // Bounce by reversing x velocity
  } else if (position.x + radius >= CONTAINER_WIDTH) {
    position.x = CONTAINER_WIDTH - radius; // Prevent going out of bounds
    velocity.invertX(); // Bounce by reversing x velocity
  }
  
  if (position.y - radius <= 0) {
    position.y = radius; // Prevent going out of bounds
    velocity.invertY(); // Bounce by reversing y velocity
  } else if (position.y + radius >= CONTAINER_HEIGHT) {
    position.y = CONTAINER_HEIGHT - radius; // Prevent going out of bounds
    velocity.invertY(); // Bounce by reversing y velocity
  }
  
  // Return updated object with new position and velocity
  return {
    ...obj,
    age: obj.age + 1,
    vector: position,
    velocity: velocity
  };
}
