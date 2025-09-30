import { sendFrameNotification } from "@/lib/notification-client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Handle new notification format for chat messages
    if (body.recipientEmail && body.type && body.title && body.message) {
      const { recipientEmail, type, title, message, data } = body;
      
      // Create notification object
      const notification = {
        id: Date.now().toString(),
        title,
        message,
        type,
        read: false,
        createdAt: new Date().toISOString(),
        data: data || {}
      };

      // Save notification to notifications.json
      const fs = require('fs');
      const path = require('path');
      const notificationsFile = path.join(process.cwd(), 'notifications.json');
      
      let notifications = [];
      if (fs.existsSync(notificationsFile)) {
        const data = fs.readFileSync(notificationsFile, 'utf-8');
        notifications = JSON.parse(data);
      }

      // Add notification for the recipient
      notifications.push({
        ...notification,
        recipientEmail
      });

      fs.writeFileSync(notificationsFile, JSON.stringify(notifications, null, 2));

      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Handle legacy Farcaster notification format
    const { fid, notification } = body;

    const result = await sendFrameNotification({
      fid,
      title: notification.title,
      body: notification.body,
      notificationDetails: notification.notificationDetails,
    });

    if (result.state === "error") {
      return NextResponse.json(
        { error: result.error },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 },
    );
  }
}
