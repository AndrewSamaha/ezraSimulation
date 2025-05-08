import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, DELETE } from './route';
import { createMockSimulation, createMockSimulationStep } from '@/test/factories';
import { NextRequest } from 'next/server';

// Mock the db module
vi.mock('@/lib/db');
// Import the mocked db
import { db } from '@/lib/db';

describe('Individual Simulation Step API Routes', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const mockParams = { 
    id: '123e4567-e89b-12d3-a456-426614174000',
    step: '1'
  };

  describe('GET /api/simulations/[id]/steps/[step]', () => {
    it('should return a specific step', async () => {
      // Arrange
      const mockSimulation = createMockSimulation({ id: mockParams.id });
      const mockStep = createMockSimulationStep({ 
        simulationId: mockParams.id, 
        stepNumber: 1,
        stepData: { objects: [] } 
      });
      
      // Mock database responses
      db.query.simulations.findFirst.mockResolvedValue(mockSimulation);
      db.query.simulationSteps.findFirst.mockResolvedValue(mockStep);
      
      // Act
      const request = new NextRequest(`http://localhost:3000/api/simulations/${mockParams.id}/steps/${mockParams.step}`);
      const response = await GET(request, { params: mockParams });
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(200);
      // Check structure but ignore exact date format
      expect(data.id).toEqual(mockStep.id);
      expect(data.simulationId).toEqual(mockStep.simulationId);
      expect(data.stepNumber).toEqual(mockStep.stepNumber);
      expect(data.stepData).toEqual(mockStep.stepData);
      expect(db.query.simulations.findFirst).toHaveBeenCalledTimes(1);
      expect(db.query.simulationSteps.findFirst).toHaveBeenCalledTimes(1);
    });
    
    it('should return 404 when simulation not found', async () => {
      // Arrange - Simulation not found
      db.query.simulations.findFirst.mockResolvedValue(null);
      
      // Act
      const request = new NextRequest(`http://localhost:3000/api/simulations/${mockParams.id}/steps/${mockParams.step}`);
      const response = await GET(request, { params: mockParams });
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(404);
      expect(data.error).toBe('Simulation not found');
      // Step should not be queried if simulation doesn't exist
      expect(db.query.simulationSteps.findFirst).not.toHaveBeenCalled();
    });
    
    it('should return 404 when step not found', async () => {
      // Arrange - Simulation exists but step doesn't
      db.query.simulations.findFirst.mockResolvedValue(createMockSimulation({ id: mockParams.id }));
      db.query.simulationSteps.findFirst.mockResolvedValue(null);
      
      // Act
      const request = new NextRequest(`http://localhost:3000/api/simulations/${mockParams.id}/steps/${mockParams.step}`);
      const response = await GET(request, { params: mockParams });
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(404);
      expect(data.error).toBe('Step not found');
    });
    
    it('should validate params', async () => {
      // Arrange - Invalid step parameter (non-numeric)
      const invalidParams = { 
        id: mockParams.id,
        step: 'not-a-number'
      };
      
      // Act
      const request = new NextRequest(`http://localhost:3000/api/simulations/${invalidParams.id}/steps/${invalidParams.step}`);
      const response = await GET(request, { params: invalidParams });
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid parameters');
      // Database should not be queried with invalid params
      expect(db.query.simulations.findFirst).not.toHaveBeenCalled();
    });
    
    it('should handle server errors', async () => {
      // Arrange - Database error
      db.query.simulations.findFirst.mockResolvedValue(createMockSimulation({ id: mockParams.id }));
      db.query.simulationSteps.findFirst.mockRejectedValue(new Error('Database error'));
      
      // Act
      const request = new NextRequest(`http://localhost:3000/api/simulations/${mockParams.id}/steps/${mockParams.step}`);
      const response = await GET(request, { params: mockParams });
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch simulation step');
    });
  });
  
  describe('DELETE /api/simulations/[id]/steps/[step]', () => {
    it('should delete a specific step', async () => {
      // Arrange
      const mockStep = createMockSimulationStep({ 
        simulationId: mockParams.id, 
        stepNumber: 1 
      });
      
      // Mock database responses
      db.query.simulationSteps.findFirst.mockResolvedValue(mockStep);
      db.delete.mockReturnThis();
      db.where.mockResolvedValue({ count: 1 });
      
      // For the "highest step" query after deletion
      const highestStepAfterDelete = createMockSimulationStep({ 
        simulationId: mockParams.id, 
        stepNumber: 2 
      });
      db.query.simulationSteps.findFirst.mockImplementation((options) => {
        // First call is to check if step exists
        if (!options?.orderBy) {
          return Promise.resolve(mockStep);
        }
        // Second call is to find highest step after deletion
        return Promise.resolve(highestStepAfterDelete);
      });
      
      // For updating the simulation's lastStep
      db.query.simulations.findFirst.mockResolvedValue(createMockSimulation({ 
        id: mockParams.id,
        lastStep: 2
      }));
      db.update.mockReturnThis();
      db.set.mockReturnThis();
      
      // Act
      const request = new NextRequest(`http://localhost:3000/api/simulations/${mockParams.id}/steps/${mockParams.step}`, {
        method: 'DELETE'
      });
      const response = await DELETE(request, { params: mockParams });
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(200);
      expect(data.message).toBe('Step deleted successfully');
      expect(db.delete).toHaveBeenCalledTimes(1);
    });
    
    it('should return 404 when step to delete not found', async () => {
      // Arrange - Step not found
      db.query.simulationSteps.findFirst.mockResolvedValue(null);
      
      // Act
      const request = new NextRequest(`http://localhost:3000/api/simulations/${mockParams.id}/steps/${mockParams.step}`, {
        method: 'DELETE'
      });
      const response = await DELETE(request, { params: mockParams });
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(404);
      expect(data.error).toBe('Step not found');
      // Should not attempt to delete non-existent step
      expect(db.delete).not.toHaveBeenCalled();
    });
    
    it('should update simulation lastStep when deleting the highest step', async () => {
      // Arrange
      const lastStep = 5;
      const deletingStep = '5';
      const params = { id: mockParams.id, step: deletingStep };
      
      // Mock that we're deleting the highest step
      const mockSimulation = createMockSimulation({ 
        id: params.id,
        lastStep
      });
      
      const mockStep = createMockSimulationStep({ 
        simulationId: params.id, 
        stepNumber: parseInt(deletingStep, 10)
      });
      
      // Next highest step after deletion
      const nextHighestStep = createMockSimulationStep({ 
        simulationId: params.id, 
        stepNumber: 4
      });
      
      // Mock database responses in a way that handles multiple calls with different args
      db.query.simulationSteps.findFirst.mockImplementation((options) => {
        // First call is to check if step exists
        if (!options?.orderBy) {
          return Promise.resolve(mockStep);
        }
        // Second call is to find highest step after deletion
        return Promise.resolve(nextHighestStep);
      });
      
      db.query.simulations.findFirst.mockResolvedValue(mockSimulation);
      db.delete.mockReturnThis();
      db.where.mockReturnThis();
      db.update.mockReturnThis();
      db.set.mockReturnThis();
      
      // Act
      const request = new NextRequest(`http://localhost:3000/api/simulations/${params.id}/steps/${params.step}`, {
        method: 'DELETE'
      });
      const response = await DELETE(request, { params });
      
      // Assert
      expect(response.status).toBe(200);
      expect(db.update).toHaveBeenCalledTimes(1);
      // Verify it's updating lastStep to 4
      expect(db.set).toHaveBeenCalledWith(
        expect.objectContaining({
          lastStep: 4,
          updatedAt: expect.any(Date)
        })
      );
    });
  });
});
