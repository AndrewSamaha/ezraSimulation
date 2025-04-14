import { SimulationObject } from '@/context/SimulationContext';
import { CONTAINER_WIDTH, CONTAINER_HEIGHT, FRICTION } from '@/lib/constants/world';
import Victor from 'victor';


/**
 * Calculates the next position and velocity for a simulation object based on physics
 */
export function doPhysics(obj: SimulationObject): SimulationObject {
  console.log('doPhysics for object:', obj.id);
  console.log('  starting position:', obj.vector);
  // console.log('  starting velocity:', obj.velocity);
  // console.log('  starting forceInput:', obj.forceInput);
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
  const distance = position.distance(newPosition);
  console.log('  MOVE',position, newPosition, distance);
  position = newPosition;

  // Get object radius for collision detection
  const radius = (obj.size || 50) / 2;
  
  // Check for boundary collisions and adjust velocity
  if (position.x - radius <= 0) {
    position.x = radius; // Prevent going out of bounds
    velocity = velocity.invertX(); // Bounce by reversing x velocity
    console.log('  bouncing x');
  } else if (position.x + radius >= CONTAINER_WIDTH) {
    position.x = CONTAINER_WIDTH - radius; // Prevent going out of bounds
    velocity = velocity.invertX(); // Bounce by reversing x velocity
    console.log('  bouncing x');
  }
  
  if (position.y - radius <= 0) {
    position.y = radius; // Prevent going out of bounds
    velocity = velocity.invertY(); // Bounce by reversing y velocity
    console.log('  bouncing y');
  } else if (position.y + radius >= CONTAINER_HEIGHT) {
    position.y = CONTAINER_HEIGHT - radius; // Prevent going out of bounds
    velocity = velocity.invertY(); // Bounce by reversing y velocity
    console.log('  bouncing y');
  }
  const forceInput = new Victor(0,0);
  
  console.log('  ending position:', position);
  // console.log('  ending velocity:', velocity);
  // console.log('  ending forceInput:', forceInput);
  const vector = position.clone();
  // Return updated object with new position and velocity
  const updatedObject = {
    ...obj,
    age: obj.age + 1,
    vector,
    velocity: velocity.clone(),
    forceInput,
  };
  console.log('  updated object:', updatedObject);
  console.log('  updatedOpject.vector:', updatedObject.vector);
  console.log('  position:', position);
  console.log('  position.clone():', position.clone());
  console.log('  updated object2:', updatedObject);
  return updatedObject;
}
