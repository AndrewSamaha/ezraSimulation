import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { simulations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createSimulationSchema } from '@/lib/validations/schema';
import { z } from 'zod';

// GET /api/simulations - Get all simulations
export async function GET() {
  try {
    const allSimulations = await db.query.simulations.findMany({
      orderBy: (simulations, { desc }) => [desc(simulations.createdAt)],
    });
    
    return NextResponse.json(allSimulations);
  } catch (error) {
    console.error('Failed to fetch simulations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch simulations' },
      { status: 500 }
    );
  }
}

// POST /api/simulations - Create a new simulation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const result = createSimulationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid simulation data', details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { name, config, initialStep } = result.data;
    
    // Create new simulation
    const [newSimulation] = await db.insert(simulations)
      .values({
        name,
        configuration: config || {},
      })
      .returning();
    
    // If initial step is provided, we would save it as step 0
    // This would be handled in a separate endpoint
    
    return NextResponse.json(newSimulation, { status: 201 });
  } catch (error) {
    console.error('Failed to create simulation:', error);
    return NextResponse.json(
      { error: 'Failed to create simulation' },
      { status: 500 }
    );
  }
}
