import { NextResponse } from 'next/server';
import { updateTask, getTasks } from '@/lib/task-storage-persistent';
import { addFreelancerRating } from '@/lib/db';
import { createNotification } from '@/lib/notifications';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { rating, review } = await req.json();
    const taskId = params.id;

    // Get the task to find freelancer info
    const tasks = await getTasks();
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Update task status to completed (or rated later if rating provided)
    const updatedTask = await updateTask(taskId, {
      status: 'completed',
      completedAt: new Date().toISOString()
    });

    if (!updatedTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Add rating if provided
    if (rating && review && task.acceptedBy) {
      const newRating = {
        id: Date.now().toString(),
        taskId,
        employerEmail: task.employerEmail,
        employerName: task.employerName,
        rating: parseInt(rating),
        review,
        createdAt: new Date().toISOString()
      };

      addFreelancerRating(task.acceptedBy.email, newRating);
      await updateTask(taskId, { status: 'rated' });
    }

    // Notify freelancer about completion (and rating if provided)
    if (task.acceptedBy) {
      await createNotification({
        userEmail: task.acceptedBy.email,
        title: rating && review ? 'Task rated' : 'Task completed',
        message: rating && review
          ? `Employer rated your work on "${task.title}" with ${parseInt(rating)} star(s).`
          : `Employer marked "${task.title}" as completed.`,
        meta: { taskId }
      });
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
