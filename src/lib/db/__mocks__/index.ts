import { vi } from 'vitest';

// Create a mock version of the db object with all the methods we need to mock
export const mockDb = {
  query: {
    simulations: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    simulationSteps: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
    performanceMetrics: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    }
  },
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  returning: vi.fn(),
};

// Export as the default export to mock the db module
export const db = mockDb;
