import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { simulationSteps, simulations } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSimulationStepSchema } from '@/lib/validations/schema';
import { z } from 'zod';

// GET /api/simulations/[id]/steps/[step] - Get a specific step
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; step: string } }
) {
  try {
    const { id, step } = params;
    const stepNumber = parseInt(step, 10);
    
    // Validate params
    const result = getSimulationStepSchema.safeParse({
      simulationId: id,
      stepNumber,
    });
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: result.error.format() },
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
    
    // Get the specific step
    const simulationStep = await db.query.simulationSteps.findFirst({
      where: and(
        eq(simulationSteps.simulationId, id),
        eq(simulationSteps.stepNumber, stepNumber)
      )
    });
    
    if (!simulationStep) {
      return NextResponse.json(
        { error: 'Step not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(simulationStep);
  } catch (error) {
    console.error('Failed to fetch simulation step:', error);
    return NextResponse.json(
      { error: 'Failed to fetch simulation step' },
      { status: 500 }
    );
  }
}

// DELETE /api/simulations/[id]/steps/[step] - Delete a specific step
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; step: string } }
) {
  try {
    const { id, step } = params;
    const stepNumber = parseInt(step, 10);
    
    // Validate params
    const result = getSimulationStepSchema.safeParse({
      simulationId: id,
      stepNumber,
    });
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: result.error.format() },
        { status: 400 }
      );
    }
    
    // Check if step exists
    const existingStep = await db.query.simulationSteps.findFirst({
      where: and(
        eq(simulationSteps.simulationId, id),
        eq(simulationSteps.stepNumber, stepNumber)
      )
    });
    
    if (!existingStep) {
      return NextResponse.json(
        { error: 'Step not found' },
        { status: 404 }
      );
    }
    
    // Delete the step
    await db.delete(simulationSteps)
      .where(and(
        eq(simulationSteps.simulationId, id),
        eq(simulationSteps.stepNumber, stepNumber)
      ));
    
    // If this was the last step, update the simulation's lastStep
    const simulation = await db.query.simulations.findFirst({
      where: eq(simulations.id, id)
    });
    
    if (simulation && simulation.lastStep === stepNumber) {
      // Find the new highest step number
      const highestStep = await db.query.simulationSteps.findFirst({
        where: eq(simulationSteps.simulationId, id),
        orderBy: (steps, { desc }) => [desc(steps.stepNumber)],
      });
      
      // Update the simulation's lastStep
      await db.update(simulations)
        .set({
          lastStep: highestStep ? highestStep.stepNumber : 0,
          updatedAt: new Date(),
        })
        .where(eq(simulations.id, id));
    }
    
    return NextResponse.json(
      { message: 'Step deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to delete simulation step:', error);
    return NextResponse.json(
      { error: 'Failed to delete simulation step' },
      { status: 500 }
    );
  }
}
