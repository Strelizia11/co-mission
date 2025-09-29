import { NextResponse } from 'next/server';
import { getTasks, updateTask } from '@/lib/task-storage-persistent';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { freelancerEmail, freelancerName } = await req.json();
    const taskId = params.id;

    if (!freelancerEmail || !freelancerName) {
      return NextResponse.json({ error: 'Freelancer information is required' }, { status: 400 });
    }

    // Find the task
    const tasks = await getTasks();
    const task = tasks.find(task => task.id === taskId);
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Check if task is still open
    if (task.status !== 'open') {
      return NextResponse.json({ error: 'Task is no longer available' }, { status: 400 });
    }

    // Update task status
    const updatedTask = await updateTask(taskId, {
      status: 'in_progress',
      acceptedBy: {
        email: freelancerEmail,
        name: freelancerName
      },
      acceptedAt: new Date().toISOString()
    });

    return NextResponse.json({ 
      message: 'Task accepted successfully!',
      task: updatedTask
    });
  } catch (error) {
    console.error('Error accepting task:', error);
    return NextResponse.json({ error: 'Failed to accept task' }, { status: 500 });
  }
}
