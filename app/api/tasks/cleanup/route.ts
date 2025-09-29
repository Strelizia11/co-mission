import { NextResponse } from 'next/server';
import { cleanupExpiredTasks } from '@/lib/task-storage-persistent';

export async function POST() {
  try {
    const remainingTasks = await cleanupExpiredTasks();
    return NextResponse.json({ 
      message: 'Cleanup completed successfully',
      remainingTasks: remainingTasks.length
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
    return NextResponse.json({ error: 'Failed to cleanup tasks' }, { status: 500 });
  }
}
