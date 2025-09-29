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
    `;
    
    if (userSkills && userSkills.length > 0) {
      contextualHelp += `\nUser's skills: ${userSkills.join(', ')}`;
    }
  } else {
    contextualHelp += `
Employer Help:
- Post new tasks with clear requirements and deadlines
- Review applications and select the best freelancer
- Manage your posted tasks and track progress
- Browse freelancer profiles to find talent
- Use the side navigation to access different features
    `;
  }
  
  // Page-specific help
  switch (currentPage) {
    case 'dashboard':
      contextualHelp += `
Dashboard Features:
- Quick stats about your account
- Quick action buttons for common tasks
- Recent activity and notifications
      `;
      break;
      
    case 'browse-tasks':
      contextualHelp += `
Browse Tasks Page:
- View all available tasks
- Filter by skills and requirements
- Apply to tasks that match your profile
- Check application deadlines
      `;
      break;
      
    case 'accepted-tasks':
      contextualHelp += `
Accepted Tasks Page:
- View tasks you've been selected for
- Submit your work before deadlines
- Track task progress and status
- Communicate with employers
      `;
      break;
      
    case 'profile':
      contextualHelp += `
Profile Management:
- Update your bio and skills
- Manage your portfolio
- Set your availability
- View your ratings and reviews
      `;
      break;
      
    case 'post-task':
      contextualHelp += `
Post Task Page:
- Create detailed task descriptions
- Set deadlines and requirements
- Specify required skills
- Set payment amount in ETH
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
      'How to use the notification system'
    ];
  } else {
    return [
      'How to post a new task',
      'How to review applications',
      'How to select a freelancer',
      'How to manage my tasks',
      'How to browse freelancer profiles',
      'How to track task progress'
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

2. "I can't apply to a task"
   - Make sure the application deadline hasn't passed
   - Check if you have the required skills
   - Ensure you're logged in as a freelancer

3. "I can't submit my work"
   - Check if the task is still in progress
   - Make sure you're submitting before the deadline
   - Try uploading files again

4. "My wallet won't connect"
   - Make sure you have a compatible wallet installed
   - Check your internet connection
   - Try refreshing the page

5. "I can't see notifications"
   - Check if notifications are enabled
   - Try refreshing the page
   - Check your browser settings
  `;
};
