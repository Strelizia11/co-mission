import { NextResponse } from 'next/server';
import { getTasks, selectFreelancer } from '@/lib/task-storage-persistent';
import { createNotification } from '@/lib/notifications';

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

    // Ensure the freelancer has applied to this task
    const hasApplied = Array.isArray(task.applications) && task.applications.some((a: any) => a?.email === freelancerEmail);
    if (!hasApplied) {
      return NextResponse.json({ error: 'Freelancer has not applied to this task' }, { status: 400 });
    }

    // Select freelancer
    const updatedTask = await selectFreelancer(taskId, freelancerEmail);

    if (!updatedTask) {
      return NextResponse.json({ error: 'Failed to select freelancer' }, { status: 500 });
    }

    // Notify both parties
    await createNotification({
      userEmail: freelancerEmail,
      title: 'You were selected',
      message: `You were selected to work on "${task.title}".`,
      meta: { taskId }
    });
    await createNotification({
      userEmail: employerEmail,
      title: 'Task started',
      message: `You selected a freelancer for "${task.title}". Ongoing.`,
      meta: { taskId }
    });

    return NextResponse.json({ 
      message: 'Freelancer selected successfully!',
      task: updatedTask
    });
  } catch (error) {
    console.error('Error selecting freelancer:', error);
    return NextResponse.json({ error: 'Failed to select freelancer' }, { status: 500 });
  }
}
