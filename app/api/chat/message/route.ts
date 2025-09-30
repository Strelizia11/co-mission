import { NextResponse } from 'next/server';
import { getUsers, saveUsers } from '@/lib/db';
import * as fs from 'fs';
import * as path from 'path';

const MESSAGES_FILE = path.join(process.cwd(), 'messages.json');

// Read messages from file
function getMessages(): any[] {
  if (!fs.existsSync(MESSAGES_FILE)) return [];
  const data = fs.readFileSync(MESSAGES_FILE, 'utf-8');
  return JSON.parse(data);
}

// Save messages to file
function saveMessages(messages: any[]) {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
}

// POST - Send a chat message
export async function POST(req: Request) {
  try {
    const messageData = await req.json();
    const { sender, recipient, text, timestamp, isFromEmployer } = messageData;

    if (!sender || !recipient || !text) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Save message to file
    const messages = getMessages();
    const newMessage = {
      ...messageData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    messages.push(newMessage);
    saveMessages(messages);

    console.log('Chat message saved:', newMessage);

    return NextResponse.json({ 
      success: true, 
      message: 'Message sent successfully',
      messageId: newMessage.id
    });
  } catch (error) {
    console.error('Error sending chat message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

// GET - Retrieve chat messages between two users
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const user1 = searchParams.get('user1');
    const user2 = searchParams.get('user2');

    if (!user1 || !user2) {
      return NextResponse.json({ error: 'Both user1 and user2 are required' }, { status: 400 });
    }

    // Get all messages and filter for conversation between these two users
    const allMessages = getMessages();
    console.log('All messages in storage:', allMessages);
    console.log('Looking for conversation between:', { user1, user2 });
    
    const conversationMessages = allMessages.filter((message: any) => {
      const isMatch = (
        (message.sender === user1 && message.recipient === user2) ||
        (message.sender === user2 && message.recipient === user1)
      );
      console.log('Message match check:', { 
        message: { sender: message.sender, recipient: message.recipient }, 
        user1, 
        user2, 
        isMatch 
      });
      return isMatch;
    });

    // Sort messages by timestamp (oldest first)
    conversationMessages.sort((a: any, b: any) => {
      return new Date(a.timestamp || a.createdAt).getTime() - new Date(b.timestamp || b.createdAt).getTime();
    });

    console.log(`Retrieved ${conversationMessages.length} messages between ${user1} and ${user2}`);
    console.log('Filtered messages:', conversationMessages);

    return NextResponse.json({ 
      messages: conversationMessages 
    });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}
