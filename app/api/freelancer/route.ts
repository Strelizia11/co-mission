import { NextResponse } from 'next/server';
import { addTask } from '@/lib/task-storage-persistent';
import { getFreelancerProfile } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { title, description, price, employerName, employerEmail, freelancerEmail, completionDeadline } = await req.json();

    if (!title || !description || !price || !employerName || !employerEmail || !freelancerEmail || !completionDeadline) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const profile = getFreelancerProfile(freelancerEmail);
    if (!profile || typeof profile.minimumRate !== 'number') {
      return NextResponse.json({ error: 'Freelancer minimum rate not set' }, { status: 400 });
    }

    if (price < profile.minimumRate) {
      return NextResponse.json({ error: `Price must be at least ${profile.minimumRate}` }, { status: 400 });
    }

    const newTask = {
      id: Date.now().toString(),
      title,
      description,
      price,
      requiredSkills: [],
      employerName,
      employerEmail,
      status: 'accepting_applications',
      createdAt: new Date().toISOString(),
      acceptanceDeadline: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      completionDeadline,
      visibility: 'private',
      directHireFreelancer: freelancerEmail,
      applications: [],
      acceptedBy: null,
      acceptedAt: null,
      completedAt: null,
      submittedFiles: null
    };

    await addTask(newTask);

    return NextResponse.json({ message: 'Direct hire task created', task: newTask });
  } catch (error) {
    console.error('Error creating direct hire task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}


