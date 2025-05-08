import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, POST } from './route';
import { createMockSimulation } from '@/test/factories';
import { NextRequest } from 'next/server';

// Mock the db module
vi.mock('@/lib/db');
// Import the mocked db
import { db } from '@/lib/db';

describe('Simulations API Routes', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('GET /api/simulations', () => {
    it('should return all simulations', async () => {
      // Arrange
      const mockSimulations = [
        createMockSimulation({ id: '123', name: 'Simulation 1' }),
        createMockSimulation({ id: '456', name: 'Simulation 2' })
      ];
      
      // Setup the mock to return our test data
      db.query.simulations.findMany.mockResolvedValue(mockSimulations);
      
      // Act
      const response = await GET();
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(200);
      // Check structure but ignore exact date format comparison
      expect(data.length).toEqual(mockSimulations.length);
      expect(data[0].id).toEqual(mockSimulations[0].id);
      expect(data[0].name).toEqual(mockSimulations[0].name);
      expect(db.query.simulations.findMany).toHaveBeenCalledTimes(1);
    });
    
    it('should handle errors properly', async () => {
      // Arrange
      db.query.simulations.findMany.mockRejectedValue(new Error('Database error'));
      
      // Act
      const response = await GET();
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch simulations');
    });
  });
  
  describe('POST /api/simulations', () => {
    it('should create a new simulation', async () => {
      // Arrange
      const simulationData = {
        name: 'New Simulation',
        config: { speed: 1.5 }
      };
      
      const newSimulation = createMockSimulation({
        id: '789',
        name: 'New Simulation',
        configuration: { speed: 1.5 }
      });
      
      // Mock the db insert and returning methods
      db.insert.mockReturnThis();
      db.values.mockReturnThis();
      db.returning.mockResolvedValue([newSimulation]);
      
      // Create a mock NextRequest with our simulation data
      const request = new NextRequest('http://localhost:3000/api/simulations', {
        method: 'POST',
        body: JSON.stringify(simulationData)
      });
      
      // Act
      const response = await POST(request);
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(201);
      // Check structure but ignore exact date format comparison
      expect(data.id).toEqual(newSimulation.id);
      expect(data.name).toEqual(newSimulation.name);
      expect(data.configuration).toEqual(newSimulation.configuration);
      expect(db.insert).toHaveBeenCalledTimes(1);
      expect(db.values).toHaveBeenCalledTimes(1);
      expect(db.returning).toHaveBeenCalledTimes(1);
    });
    
    it('should validate input data', async () => {
      // Arrange - Invalid data missing required name field
      const invalidData = {
        config: { speed: 1.5 }
      };
      
      // Create a mock NextRequest with invalid data
      const request = new NextRequest('http://localhost:3000/api/simulations', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      });
      
      // Act
      const response = await POST(request);
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid simulation data');
      // Ensure db was not called for invalid data
      expect(db.insert).not.toHaveBeenCalled();
    });
    
    it('should handle server errors', async () => {
      // Arrange
      const simulationData = {
        name: 'Error Simulation',
      };
      
      // Mock a database error
      db.insert.mockReturnThis();
      db.values.mockReturnThis();
      db.returning.mockRejectedValue(new Error('Database error'));
      
      // Create a mock request
      const request = new NextRequest('http://localhost:3000/api/simulations', {
        method: 'POST',
        body: JSON.stringify(simulationData)
      });
      
      // Act
      const response = await POST(request);
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create simulation');
    });
  });
});
