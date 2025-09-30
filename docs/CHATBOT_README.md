# Co-Mission Chatbot System

A comprehensive chatbot system integrated with Llama 3 for the Co-Mission platform, providing contextual help and guidance to users.

## Features

- **Llama 3 Integration**: Powered by local Llama 3 model
- **Contextual Help**: Provides role-specific and page-specific assistance
- **Floating Chat Widget**: Always accessible chat interface
- **Real-time Responses**: Fast AI-powered responses
- **User Context**: Understands user role and current page
- **Troubleshooting**: Built-in help for common issues

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Chat Widget  │───▶│   API Route     │───▶│  Llama 3 Script │
│   (Frontend)    │    │   /api/chat     │    │   (Python)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Context System │    │  Message Queue  │    │  Response Cache │
│  (lib/chat-     │    │  (Built-in)     │    │  (Future)       │
│   context.ts)   │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Components

### 1. Chat Widget (`app/components/ChatWidget.tsx`)
- Floating chat button (bottom-right corner)
- Expandable chat window
- Message history
- Real-time typing indicators
- Responsive design

### 2. API Route (`app/api/chat/route.ts`)
- Handles chat requests
- Integrates with Llama 3
- Provides contextual information
- Error handling

### 3. Context System (`lib/chat-context.ts`)
- Role-specific help (freelancer/employer)
- Page-specific guidance
- Quick help topics
- Troubleshooting tips

### 4. Llama 3 Integration (`scripts/llama3_chat.py`)
- Python script for Llama 3 communication
- Configurable for different setups
- Error handling and timeouts

## Setup Instructions

### 1. Install Llama 3
Follow the setup guide in `scripts/setup_llama3.md`

### 2. Configure the System
Update `scripts/llama3_chat.py` to match your Llama 3 setup:

```python
# For Ollama (recommended)
cmd = ['ollama', 'run', 'llama3', prompt]

# For llama.cpp
cmd = ['llama-cli', '--model', '/path/to/model', '--prompt', prompt]

# For custom implementation
result = your_custom_llama3_call(prompt)
```

### 3. Test the System
1. Start your Next.js app: `npm run dev`
2. Click the chat button (bottom-right)
3. Send a test message
4. Check console for errors

## Usage

### For Users
1. **Access**: Click the floating chat button
2. **Ask Questions**: Type your question and press Enter
3. **Get Help**: Receive contextual assistance based on your role and page
4. **Quick Topics**: Use suggested topics for common questions

### For Developers
1. **Add Context**: Update `lib/chat-context.ts` for new features
2. **Customize Responses**: Modify the prompt in `app/api/chat/route.ts`
3. **Add Features**: Extend the chat widget with new functionality

## Context System

The chatbot provides contextual help based on:

### User Role
- **Freelancers**: Task browsing, applications, work submission
- **Employers**: Task posting, application review, freelancer selection

### Current Page
- **Dashboard**: Quick actions, account overview
- **Browse Tasks**: Task discovery, application process
- **Profile**: Profile management, portfolio updates
- **Post Task**: Task creation, requirements setting

### Quick Help Topics
- How to browse and apply to tasks
- How to submit work for accepted tasks
- How to update profile and skills
- How to post new tasks
- How to manage applications

## Troubleshooting

### Common Issues

1. **"Llama 3 is not properly installed"**
   - Check Ollama installation: `ollama list`
   - Verify model download: `ollama run llama3 "test"`

2. **"Timeout" errors**
   - Increase timeout in Python script
   - Check system resources
   - Try smaller model

3. **"Permission denied"**
   - Make script executable: `chmod +x scripts/llama3_chat.py`
   - Check file permissions

4. **"Module not found"**
   - Install required Python packages
   - Check Python path

### Performance Optimization

1. **Use smaller models** for faster responses
2. **Adjust n-predict** parameter
3. **Add response caching**
4. **Use GPU acceleration**

## Security

- **Input validation** in API route
- **Rate limiting** (consider adding)
- **Content filtering** (consider adding)
- **Resource limits** monitoring

## Monitoring

Track performance metrics:
- Response times
- Error rates
- User satisfaction
- Resource usage

## Future Enhancements

- **Response caching** for common questions
- **Multi-language support**
- **Voice input/output**
- **Advanced context understanding**
- **Integration with task management**
- **Real-time notifications**

## API Reference

### Chat API Endpoint

**POST** `/api/chat`

**Request Body:**
```json
{
  "message": "How do I apply to a task?",
  "context": "freelancer user on browse-tasks page"
}
```

**Response:**
```json
{
  "response": "To apply to a task, click the 'Apply to Task' button...",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Context System

**getContextualHelp(context)**
- Returns contextual help string
- Based on user role and current page

**getQuickHelpTopics(role)**
- Returns array of quick help topics
- Role-specific suggestions

**getTroubleshootingTips()**
- Returns common issues and solutions
- Platform-specific troubleshooting

## Contributing

1. **Add new context** in `lib/chat-context.ts`
2. **Extend chat widget** in `app/components/ChatWidget.tsx`
3. **Improve API** in `app/api/chat/route.ts`
4. **Update documentation** as needed

## License

This chatbot system is part of the Co-Mission platform.
