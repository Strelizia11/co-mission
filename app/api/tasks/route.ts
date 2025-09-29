import { NextResponse } from 'next/server';
import { getTasksWithCleanup, addTask } from '@/lib/task-storage-persistent';

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
      completionDeadline
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

    const newTask = {
      id: Date.now().toString(),
      title,
      description,
      price,
      requiredSkills: selectedTags,
      employerName,
      employerEmail,
      status: 'accepting_applications', // accepting_applications, in_progress, completed, cancelled
      createdAt: new Date().toISOString(),
      acceptanceDeadline,
      completionDeadline,
      applications: [],
      acceptedBy: null,
      acceptedAt: null,
      completedAt: null,
      submittedFiles: null
    };

    await addTask(newTask);
    console.log('Task posted successfully:', newTask);

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
