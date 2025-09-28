import { NextResponse } from 'next/server';
import { getTasks, addTask } from '@/lib/task-storage';

export async function POST(req: Request) {
  try {
    const { title, description, price, selectedTags, employerName, employerEmail } = await req.json();

    if (!title || !description || !price || !selectedTags || !employerName || !employerEmail) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (price <= 0) {
      return NextResponse.json({ error: 'Price must be greater than 0' }, { status: 400 });
    }

    if (selectedTags.length === 0) {
      return NextResponse.json({ error: 'At least one skill tag is required' }, { status: 400 });
    }

    const newTask = {
      id: Date.now().toString(),
      title,
      description,
      price,
      requiredSkills: selectedTags,
      employerName,
      employerEmail,
      status: 'open', // open, in_progress, completed, cancelled
      createdAt: new Date().toISOString(),
      acceptedBy: null,
      completedAt: null
    };

    addTask(newTask);
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
    // Return only open tasks for freelancers to see
    const allTasks = getTasks();
    console.log('All tasks in storage:', allTasks);
    const openTasks = allTasks.filter(task => task.status === 'open');
    console.log('Open tasks:', openTasks);
    return NextResponse.json({ tasks: openTasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}
