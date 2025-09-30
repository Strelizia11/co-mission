"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ChatModal from "./ChatModal";

interface Conversation {
  employerEmail: string;
  employerName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface MessagesWidgetProps {
  user?: {
    name: string;
    role: string;
    email: string;
    skills?: string[];
  };
  activeConversation: 'none' | 'chat' | 'messages';
  setActiveConversation: (val: 'none' | 'chat' | 'messages') => void;
  setIsChatModalOpen: (open: boolean) => void;
}

export default function MessagesWidget({ user, activeConversation, setActiveConversation, setIsChatModalOpen }: MessagesWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  // Load conversations
  const loadConversations = async () => {
    if (!user || !user.email) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/chat/message?user1=${user.email}&user2=all`);
      if (response.ok) {
        const data = await response.json();
        const conversationsMap = new Map();
        let totalUnread = 0;

        data.messages.forEach((message: any) => {
          const key = message.sender === user.email ? message.recipient : message.sender;
          const name = message.sender === user.email ? message.recipientName : message.senderName;
          
          if (!conversationsMap.has(key)) {
            conversationsMap.set(key, {
              employerEmail: key,
              employerName: name,
              lastMessage: message.text,
              lastMessageTime: message.timestamp,
              unreadCount: 0,
              messages: []
            });
          }
          
          const conversation = conversationsMap.get(key);
          conversation.messages.push(message);
          
          // Update last message if this is newer
          if (new Date(message.timestamp) > new Date(conversation.lastMessageTime)) {
            conversation.lastMessage = message.text;
            conversation.lastMessageTime = message.timestamp;
          }
          
          // Count unread messages (messages not from current user)
          if (message.sender !== user.email) {
            conversation.unreadCount++;
            totalUnread++;
          }
        });

        const conversationsList = Array.from(conversationsMap.values())
          .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());

        setConversations(conversationsList);
        setUnreadCount(totalUnread);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.email && (user.role === 'freelancer' || user.role === 'employer')) {
      loadConversations();
      // Poll for new messages every 5 seconds
      const interval = setInterval(loadConversations, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      setActiveConversation('messages');
    } else if (activeConversation === 'messages') {
      setActiveConversation('none');
    }
    // eslint-disable-next-line
  }, [isOpen]);

  const handleConversationClick = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowChat(true);
    setIsChatModalOpen(true);
    setIsOpen(false);
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setSelectedConversation(null);
    setIsChatModalOpen(false);
    // Reload conversations to update unread counts
    loadConversations();
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Show for both freelancers and employers
  if (!user || (user.role !== 'freelancer' && user.role !== 'employer')) return null;

  return (
    <>
      {/* Messages Button */}
      {activeConversation === 'none' && !showChat && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 right-6 z-[60] bg-gradient-to-r from-[#FFBF00] to-[#FFD700] text-black p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          aria-label="Open messages"
        >
          <svg 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={2}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
            />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Messages Window */}
      {isOpen && !showChat && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#FFBF00] to-[#FFD700] p-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-lg">💬</span>
                </div>
                <div>
                  <h3 className="font-bold text-black">Messages</h3>
                  <p className="text-sm text-black/70">
                    {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
                    {user?.role === 'freelancer' ? ' with employers' : ' with freelancers'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-black hover:text-black/70 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">💬</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">No Messages Yet</h3>
                <p className="text-center text-sm">
                  {user?.role === 'freelancer' 
                    ? 'Start conversations with employers by applying to tasks or responding to their messages.'
                    : 'Start conversations with freelancers by browsing profiles and contacting them.'
                  }
                </p>
              </div>
            ) : (
              <div className="p-2">
                {conversations.map((conversation, index) => (
                  <div
                    key={conversation.employerEmail}
                    onClick={() => handleConversationClick(conversation)}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-indigo-600">
                        {conversation.employerName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {conversation.employerName}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(conversation.lastMessageTime)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage}
                      </p>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <div className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {conversation.unreadCount}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push('/messages');
              }}
              className="w-full bg-gradient-to-r from-[#FFBF00] to-[#FFD700] text-black px-4 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
            >
              View All Messages
            </button>
          </div>
        </div>
      )}

      {/* Chat Window */}
      {showChat && selectedConversation && (
        <ChatModal
          isOpen={showChat}
          onClose={handleCloseChat}
          currentUserEmail={user.email}
          currentUserName={user.name}
          otherUserEmail={selectedConversation.employerEmail}
          otherUserName={selectedConversation.employerName}
          currentUserRole={user.role as 'freelancer' | 'employer'}
        />
      )}
    </>
  );
}
