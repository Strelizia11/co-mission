import { NextResponse } from 'next/server';
import { getTasks, updateTask } from '@/lib/task-storage-persistent';
import { createNotification } from '@/lib/notifications';

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

    // Direct-hire acceptance
    if (task.visibility === 'private' && task.status === 'pending_acceptance' && task.directHireFreelancer === freelancerEmail) {
      const updatedTask = await updateTask(taskId, {
        status: 'accepted',
        acceptedBy: {
          email: freelancerEmail,
          name: freelancerName
        },
        acceptedAt: new Date().toISOString()
      });
      // Notify employer
      await createNotification({
        userEmail: task.employerEmail,
        title: 'Direct Hire Accepted',
        message: `${freelancerName} accepted your direct hire for "${task.title}".`,
        meta: { taskId }
      });
      return NextResponse.json({
        message: 'Direct hire accepted successfully!',
        task: updatedTask
      });
    }

    // Check if task is still accepting applications
    if (task.status !== 'accepting_applications') {
      return NextResponse.json({ error: 'Task is no longer accepting applications' }, { status: 400 });
    }

    // If task is private, only invited freelancer can accept
    if (task.visibility === 'private' && task.directHireFreelancer && task.directHireFreelancer !== freelancerEmail) {
      return NextResponse.json({ error: 'This task is a direct hire and cannot be accepted by you' }, { status: 403 });
    }

    // Update task status to accepted (employer still needs to select to start)
    const updatedTask = await updateTask(taskId, {
      status: 'accepted',
      acceptedBy: {
        email: freelancerEmail,
        name: freelancerName
      },
      acceptedAt: new Date().toISOString()
    });

    // Notify employer of acceptance
    await createNotification({
      userEmail: task.employerEmail,
      title: 'Task accepted',
      message: `${freelancerName} accepted your task "${task.title}". Select to start.`,
      meta: { taskId }
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
