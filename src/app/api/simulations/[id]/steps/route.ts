import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { simulationSteps, simulations } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { saveSimulationStepSchema } from '@/lib/validations/schema';
import { z } from 'zod';

// GET /api/simulations/[id]/steps - Get all steps for a simulation
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    
    // Validate ID format
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json(
        { error: 'Invalid simulation ID format' },
        { status: 400 }
      );
    }
    
    // Check if simulation exists
    const simulation = await db.query.simulations.findFirst({
      where: eq(simulations.id, id)
    });
    
    if (!simulation) {
      return NextResponse.json(
        { error: 'Simulation not found' },
        { status: 404 }
      );
    }
    
    // Get steps for this simulation, ordered by step number
    const steps = await db.query.simulationSteps.findMany({
      where: eq(simulationSteps.simulationId, id),
      orderBy: [desc(simulationSteps.stepNumber)],
      limit,
    });
    
    return NextResponse.json(steps);
  } catch (error) {
    console.error('Failed to fetch simulation steps:', error);
    return NextResponse.json(
      { error: 'Failed to fetch simulation steps' },
      { status: 500 }
    );
  }
}

// POST /api/simulations/[id]/steps - Save a new step
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Validate ID format and request body
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json(
        { error: 'Invalid simulation ID format' },
        { status: 400 }
      );
    }
    
    // Include the simulation ID from the URL in the validation
    const fullBody = { ...body, simulationId: id };
    const result = saveSimulationStepSchema.safeParse(fullBody);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid step data', details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { simulationId, stepNumber, stepData } = result.data;
    
    // Check if simulation exists
    const simulation = await db.query.simulations.findFirst({
      where: eq(simulations.id, simulationId)
    });
    
    if (!simulation) {
      return NextResponse.json(
        { error: 'Simulation not found' },
        { status: 404 }
      );
    }
    
    // Check if this step already exists
    const existingStep = await db.query.simulationSteps.findFirst({
      where: and(
        eq(simulationSteps.simulationId, simulationId),
        eq(simulationSteps.stepNumber, stepNumber)
      )
    });
    
    let newStep;
    
    if (existingStep) {
      // Update existing step
      [newStep] = await db.update(simulationSteps)
        .set({
          stepData,
          updatedAt: new Date(),
        })
        .where(and(
          eq(simulationSteps.simulationId, simulationId),
          eq(simulationSteps.stepNumber, stepNumber)
        ))
        .returning();
    } else {
      // Create new step
      [newStep] = await db.insert(simulationSteps)
        .values({
          simulationId,
          stepNumber,
          stepData,
        })
        .returning();
      
      // Update simulation's lastStep if this is a higher step number
      if (stepNumber > simulation.lastStep) {
        await db.update(simulations)
          .set({
            lastStep: stepNumber,
            updatedAt: new Date(),
          })
          .where(eq(simulations.id, simulationId));
      }
    }
    
    return NextResponse.json(newStep, { status: 201 });
  } catch (error) {
    console.error('Failed to save simulation step:', error);
    return NextResponse.json(
      { error: 'Failed to save simulation step' },
      { status: 500 }
    );
  }
}
