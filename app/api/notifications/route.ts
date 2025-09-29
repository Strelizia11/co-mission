import { NextResponse } from 'next/server';
import { listNotifications, createNotification, markNotificationRead } from '@/lib/notifications';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    const items = await listNotifications(email);
    return NextResponse.json({ notifications: items });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to list notifications' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userEmail, title, message, meta } = await req.json();
    if (!userEmail || !title || !message) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    const item = await createNotification({ userEmail, title, message, meta });
    return NextResponse.json({ notification: item });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, userEmail } = await req.json();
    if (!id || !userEmail) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    const updated = await markNotificationRead(id, userEmail);
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ notification: updated });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}


