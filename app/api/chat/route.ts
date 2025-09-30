import { NextRequest, NextResponse } from 'next/server';

// Fallback responses when Llama 3 is not available
function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Common questions and responses
  if (lowerMessage.includes('apply') || lowerMessage.includes('application')) {
    return "To apply to a task, go to the 'Browse Tasks' page, find a task that matches your skills, and click the 'Apply to Task' button. Make sure you have the required skills and the application deadline hasn't passed.";
  }
  
  if (lowerMessage.includes('post') || lowerMessage.includes('create task') || lowerMessage.includes('new task')) {
    return "To post a new task, go to your dashboard and click 'Post New Task'. Fill in the task details, set the deadline, specify required skills, and set the payment amount in ETH.";
  }
  
  if (lowerMessage.includes('submit') || lowerMessage.includes('work') || lowerMessage.includes('deliver')) {
    return "To submit your work, go to 'My Accepted Tasks', find the task you're working on, upload your files in the 'Submit Your Work' section, add any notes, and click 'Submit Work'.";
  }
  
  if (lowerMessage.includes('profile') || lowerMessage.includes('update') || lowerMessage.includes('edit')) {
    return "To update your profile, go to 'My Profile' in the side navigation. You can update your bio, skills, hourly rate, and availability. For freelancers, you can also manage your portfolio.";
  }
  
  if (lowerMessage.includes('browse') || lowerMessage.includes('find') || lowerMessage.includes('search') || lowerMessage.includes('task')) {
    return "To browse tasks, click 'Browse Tasks' from your dashboard. You'll see all available tasks with their requirements, deadlines, and payment amounts. Use the skill matching to find tasks that fit your expertise.";
  }
  
  if (lowerMessage.includes('notification') || lowerMessage.includes('notify') || lowerMessage.includes('bell')) {
    return "You can check notifications by clicking the bell icon in the header. Notifications will show you when you receive new task applications, when your applications are reviewed, and other important updates.";
  }
  
  if (lowerMessage.includes('wallet') || lowerMessage.includes('connect') || lowerMessage.includes('payment')) {
    return "To connect your wallet, click the 'Connect Wallet' button in the header. Make sure you have a compatible wallet installed (like MetaMask). This is required for receiving payments and posting tasks.";
  }
  
  if (lowerMessage.includes('skill') || lowerMessage.includes('expertise') || lowerMessage.includes('ability')) {
    return "To manage your skills, go to 'My Profile' and add or update your skills. This helps employers find you and helps you find relevant tasks. Make sure to add all your relevant skills and expertise.";
  }
  
  if (lowerMessage.includes('portfolio') || lowerMessage.includes('project') || lowerMessage.includes('work sample')) {
    return "To manage your portfolio, go to 'My Profile' and click on the 'Portfolio' tab. You can add projects, upload images, and showcase your previous work to attract employers.";
  }
  
  if (lowerMessage.includes('accepted') || lowerMessage.includes('my task') || lowerMessage.includes('working')) {
    return "To view your accepted tasks, go to 'My Accepted Tasks' from the dashboard. Here you can see all tasks you've been selected for, track progress, and submit your work.";
  }
  
  if (lowerMessage.includes('employer') || lowerMessage.includes('hire') || lowerMessage.includes('freelancer')) {
    return "As an employer, you can post tasks, review applications, select freelancers, and manage your projects. Use the 'Post New Task' button to create new opportunities for freelancers.";
  }
  
  if (lowerMessage.includes('help') || lowerMessage.includes('what can you do') || lowerMessage.includes('assist')) {
    return "I can help you with: browsing and applying to tasks, posting new tasks, submitting work, updating your profile, managing your portfolio, checking notifications, connecting your wallet, and troubleshooting common issues. What would you like to know?";
  }
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return "Hello! I'm your Co-Mission assistant. I can help you navigate the platform, apply to tasks, post new opportunities, manage your profile, and much more. What would you like to know?";
  }
  
  if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
    return "You're welcome! I'm here to help you succeed on the Co-Mission platform. Feel free to ask me anything about using the platform.";
  }
  
  // Default response
  return "I'm here to help you with the Co-Mission platform! You can ask me about browsing tasks, applying to tasks, posting tasks, submitting work, updating your profile, managing your portfolio, or any other platform-related questions. What would you like to know?";
}

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();
    
    // Create context for the chatbot
    const appContext = `
You are a helpful assistant for the Co-Mission platform, a blockchain-based freelancing platform. 

Platform Features:
- Freelancers can browse and apply to tasks
- Employers can post tasks and manage applications
- Tasks are paid in ETH (Ethereum)
- Users have profiles with skills and portfolios
- Real-time notifications for task updates

Common User Questions:
1. How to browse tasks: Go to "Browse Tasks" from dashboard
2. How to apply to tasks: Click "Apply to Task" on any available task
3. How to post tasks (employers): Use "Post New Task" from dashboard
4. How to manage profile: Go to "My Profile" in side navigation
5. How to submit work: Use the "Submit Work" section in accepted tasks
6. How to check notifications: Click the bell icon in header
7. How to connect wallet: Use the "Connect Wallet" button

Current user context: ${context || 'General user'}

Please provide helpful, concise answers about using the platform. If the user asks about something not related to the platform, politely redirect them to platform-related questions.
    `;

    // For now, use fallback responses directly (bypass Llama 3)
    // TODO: Enable Llama 3 integration once properly configured
    const fallbackResponse = getFallbackResponse(message);
    
    return NextResponse.json({ 
      response: fallbackResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
