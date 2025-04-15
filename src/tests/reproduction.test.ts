import { describe, it, expect, beforeEach } from 'vitest';
import { ObjectTypeEnum, SimulationObject } from '@/lib/simulation/types/SimulationObject';
import { doPhysics } from '@/lib/simulation/physics';
import { createNewOrganism } from '@/lib/simulation/behavior/organism';
import { HERBIVORE_DNA_TEMPLATE } from '@/lib/simulation/evolution/organism';
import Victor from 'victor';

describe('Reproduction and Vector Handling', () => {
  let parentOrganism: SimulationObject;
  
  beforeEach(() => {
    // Create a parent organism with known position and properties
    const initialPosition = new Victor(200, 200);
    parentOrganism = {
      id: 'parent-organism',
      objectType: ObjectTypeEnum.ORGANISM,
      color: 'green',
      size: 10,
      age: 25,
      vector: initialPosition.clone(),
      velocity: new Victor(0, 0),
      forceInput: new Victor(0.5, 0.5),
      parentId: null,
      energy: 1000,
      actionHistory: [],
      dna: HERBIVORE_DNA_TEMPLATE,
    };
  });

  it('should preserve vectors during reproduction and physics', () => {
    console.log('\n=== REPRODUCTION VECTOR TEST ===');
    
    // Log initial parent state
    console.log('\n[INITIAL PARENT]');
    console.log(`Parent ID: ${parentOrganism.id}`);
    console.log(`Position: x=${parentOrganism.vector.x}, y=${parentOrganism.vector.y}`);
    console.log(`Velocity: x=${parentOrganism.velocity.x}, y=${parentOrganism.velocity.y}`);
    console.log(`ForceInput: x=${parentOrganism.forceInput.x}, y=${parentOrganism.forceInput.y}`);
    
    // Step 1: Create child organism through reproduction
    const childOrganism = createNewOrganism(parentOrganism);
    
    // Log parent and child after reproduction
    console.log('\n[AFTER REPRODUCTION]');
    console.log(`Parent ID: ${parentOrganism.id}`);
    console.log(`Parent position: x=${parentOrganism.vector.x}, y=${parentOrganism.vector.y}`);
    console.log(`Child ID: ${childOrganism.id}`);
    console.log(`Child position: x=${childOrganism.vector.x}, y=${childOrganism.vector.y}`);
    
    // Verify both have valid vectors after reproduction
    expect(parentOrganism.vector.x).toBeGreaterThan(0);
    expect(parentOrganism.vector.y).toBeGreaterThan(0);
    expect(childOrganism.vector.x).toBeGreaterThan(0);
    expect(childOrganism.vector.y).toBeGreaterThan(0);
    
    // Store references to original vectors for later comparison
    const parentPositionBeforePhysics = { x: parentOrganism.vector.x, y: parentOrganism.vector.y };
    const childPositionBeforePhysics = { x: childOrganism.vector.x, y: childOrganism.vector.y };
    
    // Step 2: Apply physics to both organisms
    console.log('\n[APPLYING PHYSICS]');
    
    // Apply physics to parent
    console.log('\nParent before physics:');
    console.log(`Position: x=${parentOrganism.vector.x}, y=${parentOrganism.vector.y}`);
    const updatedParent = doPhysics(parentOrganism);
    console.log('\nParent after physics:');
    console.log(`Position: x=${updatedParent.vector.x}, y=${updatedParent.vector.y}`);
    
    // Apply physics to child
    console.log('\nChild before physics:');
    console.log(`Position: x=${childOrganism.vector.x}, y=${childOrganism.vector.y}`);
    const updatedChild = doPhysics(childOrganism);  
    console.log('\nChild after physics:');
    console.log(`Position: x=${updatedChild.vector.x}, y=${updatedChild.vector.y}`);
    
    // Verify vectors are still valid after physics
    expect(updatedParent.vector.x).toBeGreaterThan(0);
    expect(updatedParent.vector.y).toBeGreaterThan(0);
    expect(updatedChild.vector.x).toBeGreaterThan(0);
    expect(updatedChild.vector.y).toBeGreaterThan(0);
    
    // Verify original objects weren't mutated by physics
    expect(parentOrganism.vector.x).toEqual(parentPositionBeforePhysics.x);
    expect(parentOrganism.vector.y).toEqual(parentPositionBeforePhysics.y);
    expect(childOrganism.vector.x).toEqual(childPositionBeforePhysics.x);
    expect(childOrganism.vector.y).toEqual(childPositionBeforePhysics.y);
    
    // Apply physics multiple times to catch cumulative effects
    console.log('\n[APPLYING PHYSICS MULTIPLE TIMES]');
    let currentParent = updatedParent;
    let currentChild = updatedChild;
    
    for (let i = 0; i < 5; i++) {
      console.log(`\nIteration ${i + 1}:`);
      
      // Apply physics to parent again
      const nextParent = doPhysics(currentParent);
      console.log(`Parent position: x=${nextParent.vector.x}, y=${nextParent.vector.y}`);
      
      // Apply physics to child again
      const nextChild = doPhysics(currentChild);
      console.log(`Child position: x=${nextChild.vector.x}, y=${nextChild.vector.y}`);
      
      // Verify vectors remain valid
      expect(nextParent.vector.x).toBeGreaterThan(0);
      expect(nextParent.vector.y).toBeGreaterThan(0);
      expect(nextChild.vector.x).toBeGreaterThan(0);
      expect(nextChild.vector.y).toBeGreaterThan(0);
      
      // Advanced check: verify that the vector objects are independent references
      const originalParentX = nextParent.vector.x;
      nextParent.vector.x += 1000;
      expect(nextChild.vector.x).not.toEqual(originalParentX + 1000);
      // Restore for next iteration
      nextParent.vector.x -= 1000;
      
      // Update for next iteration
      currentParent = nextParent;
      currentChild = nextChild;
    }
    
    console.log('\n=== TEST COMPLETE ===');
  });

  it('should verify vector references are properly isolated', () => {
    // Create child organism
    const childOrganism = createNewOrganism(parentOrganism);
    
    // Store initial positions
    const initialParentPos = { x: parentOrganism.vector.x, y: parentOrganism.vector.y };
    const initialChildPos = { x: childOrganism.vector.x, y: childOrganism.vector.y };
    
    // Modify parent's vector directly
    parentOrganism.vector.x += 50;
    parentOrganism.vector.y += 50;
    
    // Child's vector should remain unchanged if references are properly isolated
    expect(childOrganism.vector.x).toEqual(initialChildPos.x);
    expect(childOrganism.vector.y).toEqual(initialChildPos.y);
    expect(childOrganism.vector.x).not.toEqual(initialParentPos.x + 50);
    expect(childOrganism.vector.y).not.toEqual(initialParentPos.y + 50);
    
    // Reset and try the reverse - modify child and check parent
    parentOrganism.vector.x = initialParentPos.x;
    parentOrganism.vector.y = initialParentPos.y;
    
    childOrganism.vector.x += 50;
    childOrganism.vector.y += 50;
    
    // Parent's vector should remain unchanged
    expect(parentOrganism.vector.x).toEqual(initialParentPos.x);
    expect(parentOrganism.vector.y).toEqual(initialParentPos.y);
  });
  
  it('should create unique vector objects when reproducing', () => {
    // Create two children from the same parent
    const child1 = createNewOrganism(parentOrganism);
    const child2 = createNewOrganism(parentOrganism);
    
    // Store initial positions
    const initialChild1Pos = { x: child1.vector.x, y: child1.vector.y };
    
    // Modify first child's vector
    child1.vector.x += 100;
    child1.vector.y += 100;
    
    // Second child's vector should be unaffected if they have independent vectors
    expect(child2.vector.x).not.toEqual(initialChild1Pos.x + 100);
    expect(child2.vector.y).not.toEqual(initialChild1Pos.y + 100);
    
    // Verify no accidental reference to parent
    expect(child1.vector).not.toBe(parentOrganism.vector);
    expect(child2.vector).not.toBe(parentOrganism.vector);
    expect(child1.vector).not.toBe(child2.vector);
  });
});
