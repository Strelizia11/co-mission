/**
 * Chat Context System for Co-Mission Platform
 * Provides contextual help based on user role and current page
 */

export interface ChatContext {
  userRole: 'freelancer' | 'employer';
  currentPage: string;
  userSkills?: string[];
  recentActions?: string[];
}

export const getContextualHelp = (context: ChatContext): string => {
  const { userRole, currentPage, userSkills } = context;
  
  let contextualHelp = `You are helping a ${userRole} on the ${currentPage} page. `;
  
  // Role-specific help
  if (userRole === 'freelancer') {
    contextualHelp += `
Freelancer Help:
- Browse available tasks and apply to ones that match your skills
- Manage your accepted tasks and submit work on time
- Update your profile and portfolio to attract employers
- Check your accomplishments and ratings
- Use the side navigation to access different features
- Build your reputation through quality work and good ratings
- Set competitive but fair rates for your services
- Keep your skills updated to match market demands
    `;
    
    if (userSkills && userSkills.length > 0) {
      contextualHelp += `\nUser's skills: ${userSkills.join(', ')}`;
      contextualHelp += `\nFocus on tasks that match these skills for better success rates.`;
    }
  } else {
    contextualHelp += `
Employer Help:
- Post new tasks with clear requirements and deadlines
- Review applications and select the best freelancer
- Manage your posted tasks and track progress
- Browse freelancer profiles to find talent
- Use the side navigation to access different features
- Set fair payment amounts to attract quality freelancers
- Provide clear feedback to help freelancers improve
- Build long-term relationships with reliable freelancers
    `;
  }
  
  // Page-specific help
  switch (currentPage) {
    case 'dashboard':
      contextualHelp += `
Dashboard Features:
- Quick stats about your account (earnings, tasks completed, ratings)
- Quick action buttons for common tasks (browse, post, profile)
- Recent activity and notifications
- Overview of your current tasks and applications
- Quick access to all platform features
      `;
      break;
      
    case 'browse-tasks':
      contextualHelp += `
Browse Tasks Page:
- View all available tasks with detailed information
- Filter by skills, payment amount, and deadline
- Apply to tasks that match your profile and skills
- Check application deadlines and requirements
- Sort tasks by relevance, payment, or deadline
- Read task descriptions carefully before applying
      `;
      break;
      
    case 'accepted-tasks':
      contextualHelp += `
Accepted Tasks Page:
- View tasks you've been selected for
- Submit your work before deadlines
- Track task progress and status
- Communicate with employers through the platform
- Upload files and provide work descriptions
- Check payment status and completion requirements
      `;
      break;
      
    case 'profile':
      contextualHelp += `
Profile Management:
- Update your bio with experience and expertise
- Add/remove skills that match your abilities
- Manage your portfolio with work samples
- Set your availability and hourly rates
- View your ratings and reviews from employers
- Update contact information and preferences
      `;
      break;
      
    case 'post-task':
      contextualHelp += `
Post Task Page:
- Create detailed, clear task descriptions
- Set realistic deadlines and requirements
- Specify required skills and experience level
- Set fair payment amount in ETH
- Add any additional requirements or preferences
- Review and publish your task
      `;
      break;
      
    case 'notifications':
      contextualHelp += `
Notifications Page:
- View all your platform notifications
- Mark notifications as read or unread
- Filter notifications by type (applications, updates, etc.)
- Get notified about new opportunities
- Stay updated on task progress and changes
      `;
      break;
      
    case 'freelancers':
      contextualHelp += `
Freelancers Directory:
- Browse freelancer profiles and portfolios
- Filter by skills, ratings, and availability
- View freelancer work history and reviews
- Contact freelancers for potential projects
- Find talent for your specific needs
      `;
      break;
  }
  
  return contextualHelp;
};

export const getQuickHelpTopics = (userRole: 'freelancer' | 'employer'): string[] => {
  if (userRole === 'freelancer') {
    return [
      'How to browse and apply to tasks',
      'How to submit work for accepted tasks',
      'How to update my profile and skills',
      'How to check my ratings and reviews',
      'How to manage my portfolio',
      'How to use the notification system',
      'How to set competitive rates',
      'How to build my reputation',
      'How to find high-paying tasks',
      'How to communicate with employers'
    ];
  } else {
    return [
      'How to post a new task',
      'How to review applications',
      'How to select a freelancer',
      'How to manage my tasks',
      'How to browse freelancer profiles',
      'How to track task progress',
      'How to set fair payment amounts',
      'How to write effective task descriptions',
      'How to provide feedback to freelancers',
      'How to build long-term relationships'
    ];
  }
};

export const getTroubleshootingTips = (): string => {
  return `
Common Issues and Solutions:

1. "I can't see any tasks"
   - Check if you're logged in correctly
   - Try refreshing the page
   - Check your internet connection
   - Make sure you have the right skills in your profile
   - Try clearing your browser cache

2. "I can't apply to a task"
   - Make sure the application deadline hasn't passed
   - Check if you have the required skills in your profile
   - Ensure you're logged in as a freelancer
   - Verify your profile is complete
   - Check if you've already applied to this task

3. "I can't submit my work"
   - Check if the task is still in progress
   - Make sure you're submitting before the deadline
   - Try uploading files again
   - Check file size limits
   - Ensure you're on the correct task page

4. "My wallet won't connect"
   - Make sure you have a compatible wallet installed (MetaMask, etc.)
   - Check your internet connection
   - Try refreshing the page
   - Make sure you're on the correct network
   - Try disconnecting and reconnecting your wallet

5. "I can't see notifications"
   - Check if notifications are enabled in your browser
   - Try refreshing the page
   - Check your browser settings for popup blockers
   - Make sure you're logged in
   - Check if you have any notifications to display

6. "I can't post a task"
   - Make sure you're logged in as an employer
   - Check if your wallet is connected
   - Verify you have sufficient ETH for the task payment
   - Ensure all required fields are filled
   - Check your internet connection

7. "I can't receive payments"
   - Verify your wallet is connected and on the correct network
   - Check if the task has been completed and approved
   - Make sure the employer has sufficient ETH
   - Contact support if payments are delayed

8. "My profile won't update"
   - Try refreshing the page
   - Check your internet connection
   - Make sure all required fields are filled
   - Try saving changes one section at a time
   - Clear your browser cache if needed
  `;
};
