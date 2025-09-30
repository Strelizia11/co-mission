import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function GET() {
  try {
    const messagesFile = path.join(process.cwd(), 'messages.json');
    console.log('Messages file path:', messagesFile);
    console.log('File exists:', fs.existsSync(messagesFile));
    
    if (!fs.existsSync(messagesFile)) {
      return NextResponse.json({ error: 'Messages file not found', path: messagesFile }, { status: 404 });
    }
    
    const data = fs.readFileSync(messagesFile, 'utf-8');
    const messages = JSON.parse(data);
    
    return NextResponse.json({ 
      success: true, 
      messageCount: messages.length,
      path: messagesFile,
      firstMessage: messages[0] || null
    });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({ 
      error: 'Failed to read messages', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
