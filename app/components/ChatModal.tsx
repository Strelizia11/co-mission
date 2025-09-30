"use client";

import { useState, useRef, useEffect } from "react";

interface ChatMessage {
  id: string;
  text: string;
  sender: string;
  senderName: string;
  recipient: string;
  recipientName: string;
  timestamp: string;
  isFromEmployer: boolean;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail: string;
  currentUserName: string;
  otherUserEmail: string;
  otherUserName: string;
  currentUserRole: 'freelancer' | 'employer';
}

export default function ChatModal({
  isOpen,
  onClose,
  currentUserEmail,
  currentUserName,
  otherUserEmail,
  otherUserName,
  currentUserRole
}: ChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    console.log('Messages updated in ChatModal:', messages);
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      // Load chat messages when chat opens
      loadMessages();
      
      // Set up polling for new messages every 3 seconds
      const messageInterval = setInterval(loadMessages, 3000);
      
      return () => clearInterval(messageInterval);
    }
  }, [isOpen, currentUserEmail, otherUserEmail]);

  const loadMessages = async () => {
    try {
      console.log('Loading messages for:', { currentUserEmail, otherUserEmail });
      
      // Check if both emails are valid
      if (!currentUserEmail || !otherUserEmail) {
        console.error('Missing email parameters:', { currentUserEmail, otherUserEmail });
        return;
      }
      
      const response = await fetch(`/api/chat/message?user1=${currentUserEmail}&user2=${otherUserEmail}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded messages:', data.messages);
        setMessages(data.messages || []);
      } else {
        const errorData = await response.json();
        console.error('Failed to load messages:', response.status, errorData);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    const messageData = {
      id: Date.now().toString(),
      text: newMessage,
      sender: currentUserEmail,
      senderName: currentUserName,
      recipient: otherUserEmail,
      recipientName: otherUserName,
      timestamp: new Date().toISOString(),
      isFromEmployer: currentUserRole === 'employer'
    };

    setMessages(prev => [...prev, messageData]);
    setNewMessage('');

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      });

      if (response.ok) {
        // Send notification to the other user
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientEmail: otherUserEmail,
            type: 'chat_message',
            title: 'New Message',
            message: `${currentUserName} sent you a message.`,
            data: {
              senderEmail: currentUserEmail,
              senderName: currentUserName,
              chatId: `${currentUserEmail}-${otherUserEmail}`,
              messageId: messageData.id
            }
          })
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FFBF00] to-[#FFD700] text-black p-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-white">
                  {otherUserName ? otherUserName.charAt(0).toUpperCase() : '👤'}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-lg text-black">Chat with {otherUserName}</h3>
                <p className="text-sm text-black/70">{otherUserEmail}</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="text-black hover:text-black/70 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === currentUserEmail ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  message.sender === currentUserEmail
                    ? 'bg-gradient-to-r from-[#FFBF00] to-[#FFD700] text-black'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.timestamp || message.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-2xl">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFBF00] focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isLoading}
              className="bg-gradient-to-r from-[#FFBF00] to-[#FFD700] text-black px-4 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
