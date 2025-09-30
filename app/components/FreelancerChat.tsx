"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

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

interface FreelancerChatProps {
  isOpen: boolean;
  onClose: () => void;
  employerEmail: string;
  employerName: string;
  freelancerEmail: string;
  freelancerName: string;
}

export default function FreelancerChat({
  isOpen,
  onClose,
  employerEmail,
  employerName,
  freelancerEmail,
  freelancerName
}: FreelancerChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [employerProfilePicture, setEmployerProfilePicture] = useState<string>('');
  const [freelancerProfilePicture, setFreelancerProfilePicture] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    console.log('Messages updated in FreelancerChat:', messages);
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      // Load chat messages when chat opens
      loadMessages();
      // Load profile pictures
      loadProfilePictures();
    }
  }, [isOpen, employerEmail, freelancerEmail]);

  const loadMessages = async () => {
    try {
      console.log('Loading messages for:', { employerEmail, freelancerEmail });
      
      // Check if both emails are valid
      if (!employerEmail || !freelancerEmail) {
        console.error('Missing email parameters:', { employerEmail, freelancerEmail });
        return;
      }
      
      const response = await fetch(`/api/chat/message?user1=${employerEmail}&user2=${freelancerEmail}`);
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

  const loadProfilePictures = async () => {
    try {
      // Fetch employer profile picture
      const employerResponse = await fetch(`/api/user/profile?email=${employerEmail}`);
      if (employerResponse.ok) {
        const employerData = await employerResponse.json();
        setEmployerProfilePicture(employerData.profile.profilePicture || '');
      }

      // Fetch freelancer profile picture
      const freelancerResponse = await fetch(`/api/user/profile?email=${freelancerEmail}`);
      if (freelancerResponse.ok) {
        const freelancerData = await freelancerResponse.json();
        setFreelancerProfilePicture(freelancerData.profile.profilePicture || '');
      }
    } catch (error) {
      console.error('Error loading profile pictures:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    const messageData = {
      id: Date.now().toString(),
      text: newMessage,
      sender: freelancerEmail,
      senderName: freelancerName,
      recipient: employerEmail,
      recipientName: employerName,
      timestamp: new Date().toISOString(),
      isFromEmployer: false
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
        // Send notification to employer
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientEmail: employerEmail,
            type: 'chat_message',
            title: 'New Message',
            message: `${freelancerName} sent you a message.`,
            data: {
              freelancerEmail: freelancerEmail,
              freelancerName: freelancerName,
              chatId: `${employerEmail}-${freelancerEmail}`,
              messageId: messageData.id
            }
          })
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-yellow-100 rounded-none shadow-none w-full h-full flex flex-col relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 p-4 rounded-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/40 rounded-full flex items-center justify-center overflow-hidden">
                {employerProfilePicture ? (
                  <Image
                    src={employerProfilePicture}
                    alt={`${employerName}'s profile`}
                    width={40}
                    height={40}
                    className="object-cover rounded-full"
                  />
                ) : (
                  <span className="text-lg font-bold text-gray-900">
                    {employerName ? employerName.charAt(0).toUpperCase() : '👤'}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg">Chat with {employerName}</h3>
                <p className="text-sm text-gray-700/80">{employerEmail}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-900 hover:text-gray-700 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <div className="w-16 h-16 bg-yellow-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <p>Start a conversation with {employerName}</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isFromEmployer ? 'justify-start' : 'justify-end'} gap-2`}
              >
                {message.isFromEmployer && (
                  <div className="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {employerProfilePicture ? (
                      <Image
                        src={employerProfilePicture}
                        alt={`${employerName}'s profile`}
                        width={32}
                        height={32}
                        className="object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-sm font-bold text-gray-700">
                        {employerName ? employerName.charAt(0).toUpperCase() : '👤'}
                      </span>
                    )}
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    message.isFromEmployer
                      ? 'bg-yellow-200 text-gray-900'
                      : 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(message.timestamp || message.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                {!message.isFromEmployer && (
                  <div className="w-8 h-8 bg-yellow-300 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {freelancerProfilePicture ? (
                      <Image
                        src={freelancerProfilePicture}
                        alt={`${freelancerName}'s profile`}
                        width={32}
                        height={32}
                        className="object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-sm font-bold text-yellow-700">
                        {freelancerName ? freelancerName.charAt(0).toUpperCase() : '👤'}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isLoading}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Add CSS to hide floating widgets when chat is open */}
        <style jsx global>{`
          .fixed.inset-0.z-\\[9999\\] ~ .fixed.bottom-6 {
            display: none !important;
          }
        `}</style>
      </div>
    </div>
  );
}
