import { NextResponse } from 'next/server';
import { getTasks, updateTask } from '@/lib/task-storage-persistent';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { freelancerEmail, files, notes } = await req.json();
    const taskId = params.id;

    if (!freelancerEmail) {
      return NextResponse.json({ error: 'Freelancer email is required' }, { status: 400 });
    }

    // Find the task
    const tasks = await getTasks();
    const task = tasks.find(task => task.id === taskId);
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Check if freelancer is assigned to this task
    if (task.acceptedBy?.email !== freelancerEmail) {
      return NextResponse.json({ error: 'You are not assigned to this task' }, { status: 403 });
    }

    // Check if task is in progress
    if (task.status !== 'in_progress') {
      return NextResponse.json({ error: 'Task is not in progress' }, { status: 400 });
    }

    // Check if completion deadline has passed
    const now = new Date();
    const completionDeadline = new Date(task.completionDeadline);
    
    if (now > completionDeadline) {
      return NextResponse.json({ error: 'Completion deadline has passed' }, { status: 400 });
    }

    // Update task with submitted work
    const updatedTask = await updateTask(taskId, {
      status: 'submitted',
      submittedFiles: files || [],
      submittedNotes: notes || '',
      submittedAt: new Date().toISOString()
    });

    if (!updatedTask) {
      return NextResponse.json({ error: 'Failed to submit work' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Work submitted successfully! Waiting for employer review.',
      task: updatedTask
    });
  } catch (error) {
    console.error('Error submitting work:', error);
    return NextResponse.json({ error: 'Failed to submit work' }, { status: 500 });
  }
}
