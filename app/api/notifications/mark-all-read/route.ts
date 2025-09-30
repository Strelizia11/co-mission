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

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    console.log(`Marking all notifications as read for ${email}`);

    // Read all notifications
    const allNotifications = getNotifications();
    console.log('All notifications before update:', allNotifications);
    
    // Find notifications for this user
    const userNotifications = allNotifications.filter(n => n.recipientEmail === email);
    console.log(`Found ${userNotifications.length} notifications for ${email}:`, userNotifications);
    
    // Mark all notifications for this user as read
    const updatedNotifications = allNotifications.map(notification => {
      if (notification.recipientEmail === email) {
        console.log(`Marking notification ${notification.id} as read`);
        return { ...notification, read: true };
      }
      return notification;
    });
    
    // Save updated notifications
    saveNotifications(updatedNotifications);
    
    const updatedUserNotifications = updatedNotifications.filter(n => n.recipientEmail === email);
    console.log(`Successfully marked all notifications as read for ${email}. Updated notifications:`, updatedUserNotifications);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
