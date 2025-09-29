import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'task_application' | 'task_selected' | 'task_completed' | 'payment' | 'system';
  read: boolean;
  createdAt: string;
  taskId?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // In a real app, you'd fetch from a database
    // For now, we'll return mock notifications
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'New Application Received',
        message: 'John Doe applied to your "Website Development" task',
        type: 'task_application',
        read: false,
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
        taskId: 'task-1'
      },
      {
        id: '2',
        title: 'Task Completed',
        message: 'Your "Logo Design" task has been completed by Jane Smith',
        type: 'task_completed',
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        taskId: 'task-2'
      },
      {
        id: '3',
        title: 'Payment Received',
        message: 'Payment of 0.5 ETH has been released for completed task',
        type: 'payment',
        read: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        taskId: 'task-3'
      },
      {
        id: '4',
        title: 'You were selected!',
        message: 'Congratulations! You have been selected for the "Mobile App Development" task',
        type: 'task_selected',
        read: false,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        taskId: 'task-4'
      }
    ];

    return NextResponse.json({ notifications: mockNotifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}