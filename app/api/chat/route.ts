import { NextRequest, NextResponse } from 'next/server';

// Enhanced fallback responses when Llama 3 is not available
function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Enhanced application and task management responses
  if (lowerMessage.includes('apply') || lowerMessage.includes('application')) {
    return "To apply to a task: 1) Go to 'Browse Tasks' from your dashboard, 2) Find a task that matches your skills and interests, 3) Click 'Apply to Task' button, 4) Write a compelling application explaining why you're the right fit, 5) Submit before the deadline. Make sure you have the required skills listed in your profile.";
  }
  
  if (lowerMessage.includes('post') || lowerMessage.includes('create task') || lowerMessage.includes('new task')) {
    return "To post a new task: 1) Go to your dashboard and click 'Post New Task', 2) Write a clear, detailed task description, 3) Set realistic deadlines, 4) Specify required skills and experience level, 5) Set fair payment amount in ETH, 6) Review and publish. Good task descriptions get better applications!";
  }
  
  if (lowerMessage.includes('submit') || lowerMessage.includes('work') || lowerMessage.includes('deliver')) {
    return "To submit your work: 1) Go to 'My Accepted Tasks' or 'My Tasks', 2) Find the task you're working on, 3) Click 'Submit Work' or 'Submit Your Work', 4) Upload all required files, 5) Add a description of what you've completed, 6) Submit before the deadline. Make sure your work meets all requirements!";
  }
  
  if (lowerMessage.includes('profile') || lowerMessage.includes('update') || lowerMessage.includes('edit')) {
    return "To update your profile: 1) Go to 'My Profile' in the side navigation, 2) Update your bio with your experience and expertise, 3) Add/remove skills that match your abilities, 4) Set your hourly rate (for freelancers), 5) Update your availability status, 6) For freelancers: manage your portfolio with work samples. A complete profile gets more opportunities!";
  }
  
  if (lowerMessage.includes('browse') || lowerMessage.includes('find') || lowerMessage.includes('search') || lowerMessage.includes('task')) {
    return "To browse tasks: 1) Click 'Browse Tasks' from your dashboard, 2) Use filters to find tasks matching your skills, 3) Read task descriptions carefully, 4) Check deadlines and payment amounts, 5) Look for tasks that match your experience level, 6) Apply to multiple relevant tasks to increase your chances. The platform shows tasks that match your skills!";
  }
  
  if (lowerMessage.includes('notification') || lowerMessage.includes('notify') || lowerMessage.includes('bell')) {
    return "To check notifications: 1) Click the bell icon in the header, 2) View all your notifications in the dropdown, 3) Click on notifications to read details, 4) Mark notifications as read by clicking on them. You'll get notified about new applications, task updates, and important platform changes.";
  }
  
  if (lowerMessage.includes('wallet') || lowerMessage.includes('connect') || lowerMessage.includes('payment')) {
    return "To connect your wallet: 1) Click 'Connect Wallet' in the header, 2) Select your wallet (MetaMask, WalletConnect, etc.), 3) Approve the connection in your wallet, 4) Make sure you're on the correct network. This is required for receiving ETH payments and posting tasks with payments.";
  }
  
  if (lowerMessage.includes('payment') || lowerMessage.includes('eth') || lowerMessage.includes('earn') || lowerMessage.includes('money')) {
    return "Payment information: 1) All payments are made in ETH (Ethereum), 2) Freelancers receive payment after task completion, 3) Employers set payment amounts when posting tasks, 4) Payments are processed automatically when work is approved, 5) You need a connected wallet to receive payments, 6) Check your earnings in your profile dashboard.";
  }
  
  if (lowerMessage.includes('skill') || lowerMessage.includes('expertise') || lowerMessage.includes('ability')) {
    return "About skills: 1) Add relevant skills to your profile to get matched with tasks, 2) Be honest about your skill level (beginner, intermediate, expert), 3) Skills help employers find you and help you find suitable tasks, 4) You can add/remove skills anytime in your profile, 5) Focus on skills you're confident in to build a good reputation.";
  }
  
  if (lowerMessage.includes('deadline') || lowerMessage.includes('time') || lowerMessage.includes('urgent')) {
    return "About deadlines: 1) Always check task deadlines before applying, 2) Make sure you can complete the work on time, 3) Submit your work before the deadline to avoid penalties, 4) If you need more time, communicate with the employer early, 5) Late submissions may affect your rating and future opportunities.";
  }
  
  if (lowerMessage.includes('rating') || lowerMessage.includes('review') || lowerMessage.includes('feedback')) {
    return "About ratings and reviews: 1) Both freelancers and employers can rate each other after task completion, 2) Good ratings help build your reputation on the platform, 3) Check your ratings in your profile, 4) High ratings help you get selected for more tasks, 5) Always deliver quality work to maintain good ratings.";
  }
  
  if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('problem')) {
    return "Need help? I can assist you with: 1) How to browse and apply to tasks, 2) How to post new tasks (for employers), 3) How to submit work and get paid, 4) How to manage your profile and skills, 5) How to use notifications and the platform features. What specific help do you need?";
  }
  
  if (lowerMessage.includes('login') || lowerMessage.includes('sign in') || lowerMessage.includes('account')) {
    return "Account help: 1) Make sure you're logged in to access all features, 2) If you can't log in, try refreshing the page, 3) Check your internet connection, 4) Make sure you have a compatible wallet connected, 5) Contact support if you continue having issues.";
  }
  
  if (lowerMessage.includes('freelancer') || lowerMessage.includes('worker') || lowerMessage.includes('contractor')) {
    return "For freelancers: 1) Browse available tasks that match your skills, 2) Apply to tasks you can complete well, 3) Submit quality work on time, 4) Build your portfolio and reputation, 5) Keep your profile updated with current skills, 6) Check notifications for new opportunities.";
  }
  
  if (lowerMessage.includes('employer') || lowerMessage.includes('client') || lowerMessage.includes('hire')) {
    return "For employers: 1) Post clear, detailed task descriptions, 2) Set realistic deadlines and fair payments, 3) Review applications carefully, 4) Select freelancers with relevant skills, 5) Provide clear feedback and requirements, 6) Pay promptly when work is completed.";
  }
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return "Hello! I'm your Co-Mission assistant. I can help you navigate the platform, apply to tasks, post new opportunities, manage your profile, and much more. What would you like to know?";
  }
  
  if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
    return "You're welcome! I'm here to help you succeed on the Co-Mission platform. Feel free to ask me anything about using the platform.";
  }
  
  // Default response for unmatched queries
  return "I'm here to help you with the Co-Mission platform! You can ask me about: browsing tasks, applying to tasks, posting tasks, submitting work, managing your profile, connecting your wallet, notifications, payments, or any other platform features. What would you like to know?";
}

// Response validation and quality checks
function validateResponse(response: string): string {
  // Ensure response is not empty
  if (!response || response.trim().length === 0) {
    return "I'm sorry, I couldn't generate a response. Please try asking your question again or rephrase it.";
  }
  
  // Ensure response is not too short (less than 10 characters)
  if (response.trim().length < 10) {
    return "I need more information to help you properly. Could you please provide more details about what you're looking for?";
  }
  
  // Ensure response is not too long (more than 2000 characters)
  if (response.trim().length > 2000) {
    return response.substring(0, 1950) + "... (Response truncated for readability)";
  }
  
  // Check for common issues and provide better responses
  if (response.toLowerCase().includes('error') && !response.toLowerCase().includes('solution')) {
    return "I encountered an issue processing your request. Please try rephrasing your question or ask about a specific platform feature.";
  }
  
  return response;
}

// Enhanced response generation with quality checks
function generateEnhancedResponse(message: string, context?: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Check for greeting patterns
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return "Hello! I'm your Co-Mission assistant. I can help you with browsing tasks, applying to opportunities, posting tasks, managing your profile, connecting your wallet, and much more. What would you like to know?";
  }
  
  // Check for thank you patterns
  if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
    return "You're welcome! I'm here to help you succeed on the Co-Mission platform. Feel free to ask me anything about using the platform.";
  }
  
  // Check for help requests
  if (lowerMessage.includes('help') || lowerMessage.includes('assist') || lowerMessage.includes('support')) {
    return "I'm here to help! I can assist you with: browsing and applying to tasks, posting new tasks (for employers), submitting work, updating your profile, managing your portfolio, connecting your wallet, checking notifications, and troubleshooting common issues. What specific help do you need?";
  }
  
  // Get the base fallback response
  const baseResponse = getFallbackResponse(message);
  
  // Add contextual information if available
  if (context && context.includes('freelancer')) {
    return baseResponse + "\n\n💡 Pro tip: As a freelancer, focus on building your reputation through quality work and good ratings. This will help you get selected for more high-paying tasks!";
  } else if (context && context.includes('employer')) {
    return baseResponse + "\n\n💡 Pro tip: As an employer, write clear task descriptions and set fair payment amounts to attract the best freelancers to your projects!";
  }
  
  return baseResponse;
}

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();
    
    // Input validation
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ 
        error: 'Message is required and must be a non-empty string' 
      }, { status: 400 });
    }
    
    // Check for message length
    if (message.length > 1000) {
      return NextResponse.json({ 
        error: 'Message is too long. Please keep your question under 1000 characters.' 
      }, { status: 400 });
    }
    
    // Generate enhanced response
    const enhancedResponse = generateEnhancedResponse(message, context);
    
    // Validate and clean the response
    const validatedResponse = validateResponse(enhancedResponse);
    
    // Log the interaction for quality monitoring
    console.log(`Chat interaction - User: "${message}" | Context: "${context || 'none'}" | Response length: ${validatedResponse.length}`);
    
    return NextResponse.json({ 
      response: validatedResponse,
      timestamp: new Date().toISOString(),
      context: context || 'general'
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'I apologize, but I encountered an error processing your request. Please try again.'
    }, { status: 500 });
  }
}