import { NextResponse } from 'next/server';
import { addFreelancerApplication, getTaskById } from '@/lib/task-storage-persistent';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { freelancerEmail, freelancerName, coverLetter } = await req.json();
    const taskId = params.id;

    if (!freelancerEmail || !freelancerName) {
      return NextResponse.json({ error: 'Freelancer information is required' }, { status: 400 });
    }

    // First, get the task to check deadline
    const task = await getTaskById(taskId);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Check if task is still accepting applications
    if (task.status !== 'accepting_applications') {
      return NextResponse.json({ error: 'Task is no longer accepting applications' }, { status: 400 });
    }

    // Check if acceptance deadline has passed
    const now = new Date();
    const acceptanceDeadline = new Date(task.acceptanceDeadline);
    
    if (now > acceptanceDeadline) {
      return NextResponse.json({ 
        error: 'Application deadline has passed. This task is no longer accepting applications.' 
      }, { status: 400 });
    }

    // Add application to task
    const updatedTask = await addFreelancerApplication(taskId, {
      email: freelancerEmail,
      name: freelancerName,
      coverLetter: coverLetter || ''
    });

    if (!updatedTask) {
      return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Application submitted successfully!',
      task: updatedTask
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
  }
}