import { NextResponse } from 'next/server';
import { getTasksWithCleanup, addTask } from '../../../lib/task-storage-persistent';
import { listNotifications, createNotification } from '../../../lib/notifications';

export async function POST(req: Request) {
  try {
    const {
      title,
      description,
      price,
      selectedTags,
      employerName,
      employerEmail,
      acceptanceDeadline,
      completionDeadline,
      visibility,
      directHireFreelancer
    } = await req.json();

    if (!title || !description || !price || !selectedTags || !employerName || !employerEmail) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (price <= 0) {
      return NextResponse.json({ error: 'Price must be greater than 0' }, { status: 400 });
    }

    if (selectedTags.length === 0) {
      return NextResponse.json({ error: 'At least one skill tag is required' }, { status: 400 });
    }

    if (!acceptanceDeadline || !completionDeadline) {
      return NextResponse.json({ error: 'Both acceptance and completion deadlines are required' }, { status: 400 });
    }

    // Validate deadlines
    const now = new Date();
    const acceptanceDate = new Date(acceptanceDeadline);
    const completionDate = new Date(completionDeadline);

    if (acceptanceDate <= now) {
      return NextResponse.json({ error: 'Acceptance deadline must be in the future' }, { status: 400 });
    }

    if (completionDate <= acceptanceDate) {
      return NextResponse.json({ error: 'Completion deadline must be after acceptance deadline' }, { status: 400 });
    }

    // Prevent duplicate posting by same employer for same title if an active task exists
    const allTasks = await getTasksWithCleanup();
    const hasActive = allTasks.some(t => t.employerEmail === employerEmail && t.title.trim().toLowerCase() === String(title).trim().toLowerCase() && ['accepting_applications','accepted','in_progress','submitted'].includes(t.status));
    if (hasActive) {
      return NextResponse.json({ error: 'You already have an active task with the same title' }, { status: 409 });
    }

    // If direct hire (private task)
    if (visibility === 'private' && directHireFreelancer) {
      const newTask = {
        id: Date.now().toString(),
        title,
        description,
        price,
        requiredSkills: selectedTags,
        employerName,
        employerEmail,
        status: 'pending_acceptance', // waiting for freelancer to accept
        createdAt: new Date().toISOString(),
        acceptanceDeadline,
        completionDeadline,
        visibility: 'private',
        directHireFreelancer,
        applications: [],
        acceptedBy: null,
        acceptedAt: null,
        completedAt: null,
        submittedFiles: null
      };
      await addTask(newTask);
      // Notify freelancer
      await createNotification({
        userEmail: directHireFreelancer,
        title: 'Direct Hire Invitation',
        message: `You have been directly hired for the task "${title}". Accept or reject this offer.`,
        meta: { taskId: newTask.id, status: newTask.status }
      });
      // Notify employer
      await createNotification({
        userEmail: employerEmail,
        title: 'Direct Hire Sent',
        message: `Your direct hire invitation for "${title}" was sent to the freelancer.`,
        meta: { taskId: newTask.id, status: newTask.status }
      });
      return NextResponse.json({
        message: 'Direct hire task sent successfully!',
        task: newTask
      });
    }

    const newTask = {
      id: Date.now().toString(),
      title,
      description,
      price,
      requiredSkills: selectedTags,
      employerName,
      employerEmail,
      status: 'accepting_applications', // accepting_applications, accepted, in_progress, submitted, completed, rated, cancelled
      createdAt: new Date().toISOString(),
      acceptanceDeadline,
      completionDeadline,
      visibility: 'public', // public | private
      directHireFreelancer: null,
      applications: [],
      acceptedBy: null,
      acceptedAt: null,
      completedAt: null,
      submittedFiles: null
    };

    await addTask(newTask);
    console.log('Task posted successfully:', newTask);

    // Notify employer that task was posted
    await createNotification({
      userEmail: employerEmail,
      title: 'Task posted',
      message: `Your task "${title}" is now public (pending request).`,
      meta: { taskId: newTask.id, status: newTask.status }
    });

    return NextResponse.json({
      message: 'Task posted successfully!',
      task: newTask
    });
  } catch (error) {
    console.error('Error posting task:', error);
    return NextResponse.json({ error: 'Failed to post task' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Return only tasks accepting applications for freelancers to see
    // This will automatically clean up expired tasks (3+ days past completion deadline)
    const allTasks = await getTasksWithCleanup();
    console.log('All tasks in storage (after cleanup):', allTasks);
    const availableTasks = allTasks.filter(task => task.status === 'accepting_applications');
    console.log('Available tasks:', availableTasks);
    return NextResponse.json({ tasks: availableTasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}
