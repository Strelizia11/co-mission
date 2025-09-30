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
    const tasks = await getTasks();
    const task = tasks.find(task => task.id === taskId);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    if (task.visibility === 'private' && task.status === 'pending_acceptance' && task.directHireFreelancer === freelancerEmail) {
      const updatedTask = await updateTask(taskId, {
        status: 'rejected',
        acceptedBy: null,
        acceptedAt: null
      });
      // Notify employer
      await createNotification({
        userEmail: task.employerEmail,
        title: 'Direct Hire Rejected',
        message: `${freelancerName} rejected your direct hire for "${task.title}".`,
        meta: { taskId }
      });
      return NextResponse.json({
        message: 'Direct hire rejected.',
        task: updatedTask
      });
    }
    return NextResponse.json({ error: 'Not allowed to reject this task.' }, { status: 403 });
  } catch (error) {
    console.error('Error rejecting direct hire:', error);
    return NextResponse.json({ error: 'Failed to reject direct hire' }, { status: 500 });
  }
}
