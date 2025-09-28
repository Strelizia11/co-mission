import { NextResponse } from 'next/server';
import { getTasksByFreelancer } from '@/lib/task-storage';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const freelancerEmail = searchParams.get('email');

    if (!freelancerEmail) {
      return NextResponse.json({ error: 'Freelancer email is required' }, { status: 400 });
    }

    const tasks = getTasksByFreelancer(freelancerEmail);
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Error fetching freelancer tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}
