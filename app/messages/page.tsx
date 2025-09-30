"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "../components/DashboardHeader";
import SideNavigation from "../components/SideNavigation";
import FreelancerChat from "../components/FreelancerChat";
import { InlineLoading } from "../components/LoadingSpinner";

interface Conversation {
  employerEmail: string;
  employerName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: any[];
}

export default function MessagesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      
      // Check if user is freelancer
      if (userData.role !== 'freelancer') {
        router.push('/dashboard');
      }
    } else {
      router.push('/auth/login');
    }
  }, [router]);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = async () => {
    try {
      // Get all messages for this freelancer
      const response = await fetch(`/api/chat/message?user1=${user.email}&user2=all`);
      if (response.ok) {
        const data = await response.json();
        console.log('All messages for freelancer:', data.messages);
        
        // Group messages by employer
        const conversationMap = new Map<string, Conversation>();
        
        data.messages.forEach((message: any) => {
          const employerEmail = message.isFromEmployer ? message.sender : message.recipient;
          const employerName = message.isFromEmployer ? message.senderName : message.recipientName;
          
          if (!conversationMap.has(employerEmail)) {
            conversationMap.set(employerEmail, {
              employerEmail,
              employerName,
              lastMessage: message.text,
              lastMessageTime: message.timestamp || message.createdAt,
              unreadCount: 0,
              messages: []
            });
          }
          
          const conversation = conversationMap.get(employerEmail)!;
          conversation.messages.push(message);
          
          // Update last message if this is newer
          const messageTime = new Date(message.timestamp || message.createdAt).getTime();
          const lastTime = new Date(conversation.lastMessageTime).getTime();
          
          if (messageTime > lastTime) {
            conversation.lastMessage = message.text;
            conversation.lastMessageTime = message.timestamp || message.createdAt;
          }
          
          // Count unread messages (messages from employer that freelancer hasn't seen)
          if (message.isFromEmployer && !message.read) {
            conversation.unreadCount++;
          }
        });
        
        // Convert to array and sort by last message time
        const conversationList = Array.from(conversationMap.values())
          .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
        
        setConversations(conversationList);
      } else {
        console.error('Failed to load conversations');
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const openConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowChat(true);
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

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Side Navigation */}
      <SideNavigation user={user} isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
      
      {/* Main Content Area */}
      <div className={`flex-1`}>
        {/* Header */}
        <DashboardHeader user={user} onToggleNav={() => setIsNavOpen(true)} />
        
        {/* Messages Content */}
        <div className="max-w-7xl mx-auto p-6">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-8 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">Messages</h1>
                  <p className="text-white/90 text-lg">Communicate with employers about projects</p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30"
                  >
                    ← Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <InlineLoading text="Loading conversations..." />
          ) : conversations.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No messages yet</h3>
              <p className="text-gray-600 mb-6">When employers contact you, your conversations will appear here</p>
              <button
                onClick={() => router.push('/tasks/browse')}
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
              >
                Browse Tasks
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {conversations.map((conversation) => (
                <div
                  key={conversation.employerEmail}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 cursor-pointer"
                  onClick={() => openConversation(conversation)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-semibold text-lg">
                          {conversation.employerName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {conversation.employerName}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {conversation.lastMessage.length > 50 
                            ? conversation.lastMessage.substring(0, 50) + '...'
                            : conversation.lastMessage
                          }
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 mb-1">
                        {formatTimeAgo(conversation.lastMessageTime)}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 font-semibold">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Freelancer Chat Interface */}
      {showChat && selectedConversation && user && (
        <FreelancerChat
          isOpen={showChat}
          onClose={() => {
            setShowChat(false);
            setSelectedConversation(null);
            loadConversations(); // Refresh conversations
          }}
          employerEmail={selectedConversation.employerEmail}
          employerName={selectedConversation.employerName}
          freelancerEmail={user.email}
          freelancerName={user.name}
        />
      )}
    </div>
  );
}
