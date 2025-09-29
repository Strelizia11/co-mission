import { NextResponse } from 'next/server';
import { updateTask } from '@/lib/task-storage-persistent';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { freelancerEmail } = await req.json();
    const taskId = params.id;

    if (!freelancerEmail) {
      return NextResponse.json({ error: 'Freelancer email is required' }, { status: 400 });
    }

    // Update task status to submitted
    const updatedTask = await updateTask(taskId, {
      status: 'submitted',
      submittedAt: new Date().toISOString()
    });

    if (!updatedTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Work submitted successfully!',
      task: updatedTask
    });
  } catch (error) {
    console.error('Error submitting work:', error);
    return NextResponse.json({ error: 'Failed to submit work' }, { status: 500 });
  }
}
