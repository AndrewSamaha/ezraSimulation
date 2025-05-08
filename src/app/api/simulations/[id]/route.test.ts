import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, PATCH, DELETE } from './route';
import { createMockSimulation } from '@/test/factories';
import { NextRequest } from 'next/server';

// Mock the db module
vi.mock('@/lib/db');
// Import the mocked db
import { db } from '@/lib/db';

describe('Individual Simulation API Routes', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const mockParams = { id: '123e4567-e89b-12d3-a456-426614174000' };

  describe('GET /api/simulations/[id]', () => {
    it('should return a simulation by ID', async () => {
      // Arrange
      const mockSimulation = createMockSimulation({ 
        id: mockParams.id,
        name: 'Test Simulation'
      });
      
      db.query.simulations.findFirst.mockResolvedValue(mockSimulation);
      
      // Act
      const request = new NextRequest(`http://localhost:3000/api/simulations/${mockParams.id}`);
      const response = await GET(request, { params: mockParams });
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(200);
      // Check structure but ignore exact date format comparison
      expect(data.id).toEqual(mockSimulation.id);
      expect(data.name).toEqual(mockSimulation.name);
      expect(data.lastStep).toEqual(mockSimulation.lastStep);
      expect(db.query.simulations.findFirst).toHaveBeenCalledTimes(1);
    });
    
    it('should return 404 when simulation not found', async () => {
      // Arrange - Simulation not found
      db.query.simulations.findFirst.mockResolvedValue(null);
      
      // Act
      const request = new NextRequest(`http://localhost:3000/api/simulations/${mockParams.id}`);
      const response = await GET(request, { params: mockParams });
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(404);
      expect(data.error).toBe('Simulation not found');
    });
    
    it('should validate ID format', async () => {
      // Arrange - Invalid UUID
      const invalidParams = { id: 'not-a-uuid' };
      
      // Act
      const request = new NextRequest(`http://localhost:3000/api/simulations/${invalidParams.id}`);
      const response = await GET(request, { params: invalidParams });
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid simulation ID format');
      // Database should not be queried with invalid ID
      expect(db.query.simulations.findFirst).not.toHaveBeenCalled();
    });
    
    it('should handle server errors', async () => {
      // Arrange - Database error
      db.query.simulations.findFirst.mockRejectedValue(new Error('Database error'));
      
      // Act
      const request = new NextRequest(`http://localhost:3000/api/simulations/${mockParams.id}`);
      const response = await GET(request, { params: mockParams });
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch simulation');
    });
  });
  
  describe('PATCH /api/simulations/[id]', () => {
    it('should update a simulation', async () => {
      // Arrange
      const existingSimulation = createMockSimulation({ id: mockParams.id });
      const updateData = { name: 'Updated Simulation Name' };
      const updatedSimulation = { ...existingSimulation, ...updateData };
      
      // Mock database responses
      db.query.simulations.findFirst.mockResolvedValue(existingSimulation);
      db.update.mockReturnThis();
      db.set.mockReturnThis();
      db.where.mockReturnThis();
      db.returning.mockResolvedValue([updatedSimulation]);
      
      // Create request with update data
      const request = new NextRequest(`http://localhost:3000/api/simulations/${mockParams.id}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData)
      });
      
      // Act
      const response = await PATCH(request, { params: mockParams });
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(200);
      // Check structure but ignore exact date format comparison
      expect(data.id).toEqual(updatedSimulation.id);
      expect(data.name).toEqual(updatedSimulation.name);
      expect(data.lastStep).toEqual(updatedSimulation.lastStep);
      expect(db.update).toHaveBeenCalledTimes(1);
      expect(db.set).toHaveBeenCalledTimes(1);
      expect(db.where).toHaveBeenCalledTimes(1);
      expect(db.returning).toHaveBeenCalledTimes(1);
    });
    
    it('should return 404 when simulation to update not found', async () => {
      // Arrange - Simulation not found
      db.query.simulations.findFirst.mockResolvedValue(null);
      
      // Create request with update data
      const request = new NextRequest(`http://localhost:3000/api/simulations/${mockParams.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: 'New Name' })
      });
      
      // Act
      const response = await PATCH(request, { params: mockParams });
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(404);
      expect(data.error).toBe('Simulation not found');
      // Should not attempt to update non-existent simulation
      expect(db.update).not.toHaveBeenCalled();
    });
    
    it('should validate update data', async () => {
      // Arrange - Invalid update data (lastStep can't be negative)
      const existingSimulation = createMockSimulation({ id: mockParams.id });
      const invalidData = { lastStep: -5 };
      
      // Mock database response for finding simulation
      db.query.simulations.findFirst.mockResolvedValue(existingSimulation);
      
      // Create request with invalid data
      const request = new NextRequest(`http://localhost:3000/api/simulations/${mockParams.id}`, {
        method: 'PATCH',
        body: JSON.stringify(invalidData)
      });
      
      // Act
      const response = await PATCH(request, { params: mockParams });
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid update data');
      // Should not attempt update with invalid data
      expect(db.update).not.toHaveBeenCalled();
    });
  });
  
  describe('DELETE /api/simulations/[id]', () => {
    it('should delete a simulation', async () => {
      // Arrange
      const existingSimulation = createMockSimulation({ id: mockParams.id });
      
      // Mock database responses
      db.query.simulations.findFirst.mockResolvedValue(existingSimulation);
      db.delete.mockReturnThis();
      db.where.mockResolvedValue({ count: 1 });
      
      // Create request
      const request = new NextRequest(`http://localhost:3000/api/simulations/${mockParams.id}`, {
        method: 'DELETE'
      });
      
      // Act
      const response = await DELETE(request, { params: mockParams });
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(200);
      expect(data.message).toBe('Simulation deleted successfully');
      expect(db.delete).toHaveBeenCalledTimes(1);
      expect(db.where).toHaveBeenCalledTimes(1);
    });
    
    it('should return 404 when simulation to delete not found', async () => {
      // Arrange - Simulation not found
      db.query.simulations.findFirst.mockResolvedValue(null);
      
      // Create request
      const request = new NextRequest(`http://localhost:3000/api/simulations/${mockParams.id}`, {
        method: 'DELETE'
      });
      
      // Act
      const response = await DELETE(request, { params: mockParams });
      const data = await response.json();
      
      // Assert
      expect(response.status).toBe(404);
      expect(data.error).toBe('Simulation not found');
      // Should not attempt to delete non-existent simulation
      expect(db.delete).not.toHaveBeenCalled();
    });
  });
});
