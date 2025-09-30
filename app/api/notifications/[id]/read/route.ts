import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const NOTIFICATIONS_FILE = path.join(process.cwd(), 'notifications.json');

// Read notifications from file
function getNotifications(): any[] {
  if (!fs.existsSync(NOTIFICATIONS_FILE)) return [];
  const data = fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8');
  return JSON.parse(data);
}

// Save notifications to file
function saveNotifications(notifications: any[]) {
  fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2));
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { email } = await request.json();
    const notificationId = params.id;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    console.log(`Marking notification ${notificationId} as read for ${email}`);

    // Read all notifications
    const allNotifications = getNotifications();
    
    // Find and update the specific notification
    const notificationIndex = allNotifications.findIndex(n => 
      n.id === notificationId && n.recipientEmail === email
    );

    if (notificationIndex === -1) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    // Mark as read
    allNotifications[notificationIndex].read = true;
    
    // Save updated notifications
    saveNotifications(allNotifications);

    console.log(`Successfully marked notification ${notificationId} as read`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
