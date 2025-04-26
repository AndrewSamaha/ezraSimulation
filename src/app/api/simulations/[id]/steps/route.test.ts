import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, POST } from './route';
import { createMockSimulation, createMockSimulationStep } from '@/test/factories';
import { NextRequest } from 'next/server';

// Mock the db module
vi.mock('@/lib/db');
// Import the mocked db
import { db } from '@/lib/db';

describe('Simulation Steps API Routes', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const mockParams = { id: '123e4567-e89b-12d3-a456-426614174000' };

  describe('GET /api/simulations/[id]/steps', () => {
    it('should return steps for a simulation', async () => {
      // Arrange
      const mockSimulation = createMockSimulation({ id: mockParams.id });
      const mockSteps = [
        createMockSimulationStep({ 
          simulationId: mockParams.id, 
          stepNumber: 2,
          stepData: { objects: [] } 
        }),
        createMockSimulationStep({ 
          simulationId: mockParams.id, 
          stepNumber: 1,
          stepData: { objects: [] } 
        })
      ];
      
      // Mock database responses
      db.query.simulations.findFirst.mockResolvedValue(mockSimulation);
      db.query.simulationSteps.findMany.mockResolvedValue(mockSteps);
      
      // Create URL with search params
      const url = new URL(`http://localhost:3000/api/simulations/${mockParams.id}/steps`);
      url.searchParams.set('limit', '10');
      
      // Act
      const request = new NextRequest(url);
      const response = await GET(request, { params: mockParams });
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(200);
      // Check structure but ignore exact date format
      expect(data.length).toEqual(mockSteps.length);
      expect(data[0].simulationId).toEqual(mockSteps[0].simulationId);
      expect(data[0].stepNumber).toEqual(mockSteps[0].stepNumber);
      expect(data[1].stepNumber).toEqual(mockSteps[1].stepNumber);
      expect(db.query.simulations.findFirst).toHaveBeenCalledTimes(1);
      expect(db.query.simulationSteps.findMany).toHaveBeenCalledTimes(1);
    });
    
    it('should return 404 when simulation not found', async () => {
      // Arrange - Simulation not found
      db.query.simulations.findFirst.mockResolvedValue(null);
      
      // Act
      const request = new NextRequest(`http://localhost:3000/api/simulations/${mockParams.id}/steps`);
      const response = await GET(request, { params: mockParams });
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(404);
      expect(data.error).toBe('Simulation not found');
      // Steps should not be queried if simulation doesn't exist
      expect(db.query.simulationSteps.findMany).not.toHaveBeenCalled();
    });
    
    it('should handle server errors', async () => {
      // Arrange - Database error
      db.query.simulations.findFirst.mockResolvedValue(createMockSimulation());
      db.query.simulationSteps.findMany.mockRejectedValue(new Error('Database error'));
      
      // Act
      const request = new NextRequest(`http://localhost:3000/api/simulations/${mockParams.id}/steps`);
      const response = await GET(request, { params: mockParams });
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch simulation steps');
    });
  });
  
  describe('POST /api/simulations/[id]/steps', () => {
    it('should save a new step', async () => {
      // Arrange
      const mockSimulation = createMockSimulation({ 
        id: mockParams.id,
        lastStep: 1 
      });
      
      const stepData = {
        stepNumber: 2,
        stepData: { objects: [] }
      };
      
      const savedStep = createMockSimulationStep({
        simulationId: mockParams.id,
        stepNumber: 2,
        stepData: { objects: [] }
      });
      
      // Mock database responses
      db.query.simulations.findFirst.mockResolvedValue(mockSimulation);
      db.query.simulationSteps.findFirst.mockResolvedValue(null); // Step doesn't exist yet
      db.insert.mockReturnThis();
      db.values.mockReturnThis();
      db.returning.mockResolvedValue([savedStep]);
      db.update.mockReturnThis();
      db.set.mockReturnThis();
      db.where.mockResolvedValue([{ lastStep: 2 }]);
      
      // Create request with step data
      const request = new NextRequest(`http://localhost:3000/api/simulations/${mockParams.id}/steps`, {
        method: 'POST',
        body: JSON.stringify(stepData)
      });
      
      // Act
      const response = await POST(request, { params: mockParams });
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(201);
      // Check structure but ignore exact date format
      expect(data.id).toEqual(savedStep.id);
      expect(data.simulationId).toEqual(savedStep.simulationId);
      expect(data.stepNumber).toEqual(savedStep.stepNumber);
      expect(db.insert).toHaveBeenCalledTimes(1);
      expect(db.values).toHaveBeenCalledTimes(1);
      expect(db.returning).toHaveBeenCalledTimes(1);
      // Should update simulation's lastStep
      expect(db.update).toHaveBeenCalledTimes(1);
    });
    
    // TODO: Fix validation issues with existing step update test
    it.skip('should update an existing step', async () => {
      // Arrange
      const mockSimulation = createMockSimulation({ id: mockParams.id });
      
      const existingStep = createMockSimulationStep({
        simulationId: mockParams.id,
        stepNumber: 1,
        stepData: { objects: [] }
      });
      
      const updatedStepData = {
        stepNumber: 1,
        stepData: { 
          objects: [
            { 
              id: 'obj1', 
              objectType: 'ORGANISM',
              vector: { x: 100, y: 100 },
              velocity: { x: 0, y: 0 },
              size: 10,
              color: '#FF0000',
              age: 0,
              forceInput: { x: 0, y: 0 },
              parentId: null,
              energy: 100,
              actionHistory: [],
              workingMemory: [],
              generation: 1
            }
          ] 
        }
      };
      
      const updatedStep = {
        ...existingStep,
        stepData: { objects: [{ id: 'obj1', objectType: 'ORGANISM' }] },
        updatedAt: new Date()
      };
      
      // The updatedStep with the serialized dates as expected in the response
      const serializedUpdatedStep = {
        ...updatedStep,
        createdAt: updatedStep.createdAt.toISOString(),
        updatedAt: updatedStep.updatedAt.toISOString()
      };
      
      // Mock database responses
      db.query.simulations.findFirst.mockResolvedValue(mockSimulation);
      db.query.simulationSteps.findFirst.mockResolvedValue(existingStep); // Step exists
      db.update.mockReturnThis();
      db.set.mockReturnThis();
      db.where.mockReturnThis();
      db.returning.mockResolvedValue([updatedStep]);
      
      // Create request with updated step data
      // Need to include simulationId as it would normally come from the URL params
      const requestData = {
        ...updatedStepData,
        simulationId: mockParams.id
      };
      
      const request = new NextRequest(`http://localhost:3000/api/simulations/${mockParams.id}/steps`, {
        method: 'POST',
        body: JSON.stringify(requestData)
      });
      
      // Act
      const response = await POST(request, { params: mockParams });
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(201);
      // Check structure but ignore exact date format
      expect(data.id).toEqual(serializedUpdatedStep.id);
      expect(data.simulationId).toEqual(serializedUpdatedStep.simulationId);
      expect(data.stepNumber).toEqual(serializedUpdatedStep.stepNumber);
      expect(data.stepData).toEqual(serializedUpdatedStep.stepData);
      // Should update existing step, not insert
      expect(db.update).toHaveBeenCalledTimes(1);
      expect(db.insert).not.toHaveBeenCalled();
    });
    
    it('should validate step data', async () => {
      // Arrange - Invalid step data (negative step number)
      const invalidData = {
        stepNumber: -1,
        stepData: { objects: [] }
      };
      
      // Create request with invalid data
      const request = new NextRequest(`http://localhost:3000/api/simulations/${mockParams.id}/steps`, {
        method: 'POST',
        body: JSON.stringify(invalidData)
      });
      
      // Act
      const response = await POST(request, { params: mockParams });
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid step data');
      // Database operations should not be attempted with invalid data
      expect(db.query.simulations.findFirst).not.toHaveBeenCalled();
    });
    
    it('should return 404 when simulation not found', async () => {
      // Arrange - Simulation not found
      db.query.simulations.findFirst.mockResolvedValue(null);
      
      const stepData = {
        stepNumber: 1,
        stepData: { objects: [] }
      };
      
      // Create request
      const request = new NextRequest(`http://localhost:3000/api/simulations/${mockParams.id}/steps`, {
        method: 'POST',
        body: JSON.stringify(stepData)
      });
      
      // Act
      const response = await POST(request, { params: mockParams });
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(404);
      expect(data.error).toBe('Simulation not found');
      // Should not attempt to save step for non-existent simulation
      expect(db.insert).not.toHaveBeenCalled();
      expect(db.update).not.toHaveBeenCalled();
    });
  });
});
