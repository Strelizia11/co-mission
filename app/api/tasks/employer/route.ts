import { NextResponse } from 'next/server';
import { getTasksByEmployer } from '@/lib/task-storage-persistent';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const employerEmail = searchParams.get('email');

    if (!employerEmail) {
      return NextResponse.json({ error: 'Employer email is required' }, { status: 400 });
    }

    const tasks = await getTasksByEmployer(employerEmail);
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Error fetching employer tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}
