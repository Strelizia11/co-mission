import { NextResponse } from 'next/server';
import { updateTask } from '@/lib/task-storage-persistent';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;

    // Update task status to completed
    const updatedTask = await updateTask(taskId, {
      status: 'completed',
      completedAt: new Date().toISOString()
    });

    if (!updatedTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Task completed successfully!',
      task: updatedTask
    });
  } catch (error) {
    console.error('Error completing task:', error);
    return NextResponse.json({ error: 'Failed to complete task' }, { status: 500 });
  }
}
