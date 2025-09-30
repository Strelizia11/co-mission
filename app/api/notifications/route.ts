import { NextRequest, NextResponse } from 'next/server';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'task_application' | 'task_selected' | 'task_completed' | 'payment' | 'system' | 'chat_message';
  read: boolean;
  createdAt: string;
  taskId?: string;
  recipientEmail?: string;
  data?: any;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Read notifications from file
    const fs = require('fs');
    const path = require('path');
    const notificationsFile = path.join(process.cwd(), 'notifications.json');
    
    let allNotifications: Notification[] = [];
    if (fs.existsSync(notificationsFile)) {
      const data = fs.readFileSync(notificationsFile, 'utf-8');
      allNotifications = JSON.parse(data);
    }

    // Filter notifications for the specific user
    const userNotifications = allNotifications.filter(notification => 
      notification.recipientEmail === email
    );

    // Sort by creation date (newest first)
    userNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ notifications: userNotifications }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}