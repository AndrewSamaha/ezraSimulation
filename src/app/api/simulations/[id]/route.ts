import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { simulations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// GET /api/simulations/[id] - Get a simulation by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;

    // Validate ID format
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json({ error: 'Invalid simulation ID format' }, { status: 400 });
    }

    const simulation = await db.query.simulations.findFirst({
      where: eq(simulations.id, id),
    });

    if (!simulation) {
      return NextResponse.json({ error: 'Simulation not found' }, { status: 404 });
    }

    return NextResponse.json(simulation);
  } catch (error) {
    console.error('Failed to fetch simulation:', error);
    return NextResponse.json({ error: 'Failed to fetch simulation' }, { status: 500 });
  }
}

// PATCH /api/simulations/[id] - Update a simulation
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate ID format
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json({ error: 'Invalid simulation ID format' }, { status: 400 });
    }

    // Validate update data
    const updateSchema = z.object({
      name: z.string().optional(),
      lastStep: z.number().int().nonnegative().optional(),
      configuration: z.record(z.unknown()).optional(),
    });

    const result = updateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid update data', details: result.error.format() },
        { status: 400 },
      );
    }

    // Check if simulation exists
    const existing = await db.query.simulations.findFirst({
      where: eq(simulations.id, id),
    });

    if (!existing) {
      return NextResponse.json({ error: 'Simulation not found' }, { status: 404 });
    }

    // Update simulation
    const [updated] = await db
      .update(simulations)
      .set({
        ...result.data,
        updatedAt: new Date(),
      })
      .where(eq(simulations.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update simulation:', error);
    return NextResponse.json({ error: 'Failed to update simulation' }, { status: 500 });
  }
}

// DELETE /api/simulations/[id] - Delete a simulation
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;

    // Validate ID format
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json({ error: 'Invalid simulation ID format' }, { status: 400 });
    }

    // Check if simulation exists
    const existing = await db.query.simulations.findFirst({
      where: eq(simulations.id, id),
    });

    if (!existing) {
      return NextResponse.json({ error: 'Simulation not found' }, { status: 404 });
    }

    // Delete simulation - cascade will handle related records due to foreign key constraints
    await db.delete(simulations).where(eq(simulations.id, id));

    return NextResponse.json({ message: 'Simulation deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete simulation:', error);
    return NextResponse.json({ error: 'Failed to delete simulation' }, { status: 500 });
  }
}
