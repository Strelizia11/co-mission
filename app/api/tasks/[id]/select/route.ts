import { NextResponse } from 'next/server';
import { getTasks, selectFreelancer } from '@/lib/task-storage-persistent';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { freelancerEmail, employerEmail } = await req.json();
    const taskId = params.id;

    if (!freelancerEmail || !employerEmail) {
      return NextResponse.json({ error: 'Freelancer email and employer email are required' }, { status: 400 });
    }

    // Find the task
    const tasks = await getTasks();
    const task = tasks.find(task => task.id === taskId);
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Check if task belongs to the employer
    if (task.employerEmail !== employerEmail) {
      return NextResponse.json({ error: 'Unauthorized to select freelancer for this task' }, { status: 403 });
    }

    // Check if task is still accepting applications or in review
    if (task.status !== 'accepting_applications' && task.status !== 'employer_review') {
      return NextResponse.json({ error: 'Task is no longer accepting freelancer selection' }, { status: 400 });
    }

    // Check if freelancer has applied
    const hasApplied = task.applications?.some(
      (app: any) => app.email === freelancerEmail
    );

    if (!hasApplied) {
      return NextResponse.json({ error: 'Freelancer has not applied for this task' }, { status: 400 });
    }

    // Select freelancer
    const updatedTask = await selectFreelancer(taskId, freelancerEmail);

    if (!updatedTask) {
      return NextResponse.json({ error: 'Failed to select freelancer' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Freelancer selected successfully!',
      task: updatedTask
    });
  } catch (error) {
    console.error('Error selecting freelancer:', error);
    return NextResponse.json({ error: 'Failed to select freelancer' }, { status: 500 });
  }
}
