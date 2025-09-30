"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "../components/DashboardHeader";
import SideNavigation from "../components/SideNavigation";
import { InlineLoading } from "../components/LoadingSpinner";

interface Freelancer {
  email: string;
  name: string;
  bio?: string;
  skills: string[];
  hourlyRate?: number;
  availability: 'available' | 'busy' | 'unavailable';
  averageRating: number;
  totalRatings: number;
  completedTasks: number;
  joinedAt: string;
  portfolio: any[];
  profilePicture?: string;
}

export default function BrowseFreelancersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [filteredFreelancers, setFilteredFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    keyword: '',
    skills: [] as string[],
    minRate: '',
    maxRate: '',
    availability: 'all' as 'all' | 'available' | 'busy' | 'unavailable',
    minRating: '',
    sortBy: 'newest' as 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'rate_high' | 'rate_low'
  });

  // 1. Add state for modal and form
  const [showHireModal, setShowHireModal] = useState(false);
  const [hireTarget, setHireTarget] = useState<Freelancer | null>(null);
  const [hireForm, setHireForm] = useState({
    title: '',
    description: '',
    price: '',
    selectedTags: [] as string[],
    acceptanceDeadline: '',
    completionDeadline: ''
  });
  const [hireMessage, setHireMessage] = useState('');
  const [hireSubmitting, setHireSubmitting] = useState(false);

  // Contact chat state
  const [showContactChat, setShowContactChat] = useState(false);
  const [contactTarget, setContactTarget] = useState<Freelancer | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatSubmitting, setChatSubmitting] = useState(false);

  const SKILL_TAGS = [
    "Web Development", "Mobile Development", "UI/UX Design", "Graphic Design",
    "Content Writing", "Digital Marketing", "Data Analysis", "Blockchain Development",
    "Smart Contract Development", "DeFi Development", "NFT Development", "Game Development",
    "Video Editing", "Photography", "Translation", "Virtual Assistant",
    "Social Media Management", "SEO", "Copywriting", "Technical Writing"
  ];

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      
      // Check if user is employer
      if (userData.role !== 'employer') {
        router.push('/dashboard');
      }
    } else {
      router.push('/auth/login');
    }
  }, [router]);

  useEffect(() => {
    if (user) {
      fetchFreelancers();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [freelancers, filters]);

  useEffect(() => {
    console.log('Chat messages updated in employer interface:', chatMessages);
  }, [chatMessages]);

  const fetchFreelancers = async () => {
    try {
      const response = await fetch('/api/freelancer/profiles');
      
      if (!response.ok) {
        console.error('Failed to fetch freelancers:', response.status, response.statusText);
        setMessage('Failed to load freelancers');
        return;
      }
      
      const data = await response.json();
      
      if (Array.isArray(data.profiles)) {
        console.log('Freelancers data received:', data.profiles);
        setFreelancers(data.profiles);
      } else {
        console.error('Invalid freelancers data format:', data);
        setMessage('Invalid freelancers data received');
      }
    } catch (error) {
      console.error('Error fetching freelancers:', error);
      setMessage('Failed to load freelancers');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    if (!freelancers || !Array.isArray(freelancers)) {
      setFilteredFreelancers([]);
      return;
    }
    let filtered = [...freelancers];

    // Keyword filter
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      filtered = filtered.filter(freelancer => 
        (freelancer.name && freelancer.name.toLowerCase().includes(keyword)) ||
        (freelancer.bio && freelancer.bio.toLowerCase().includes(keyword)) ||
        (freelancer.skills && freelancer.skills.some(skill => skill.toLowerCase().includes(keyword)))
      );
    }

    // Skills filter
    if (filters.skills.length > 0) {
      filtered = filtered.filter(freelancer =>
        freelancer.skills && filters.skills.some(skill => 
          freelancer.skills.some(freelancerSkill => 
            freelancerSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    }

    // Rate filter
    if (filters.minRate) {
      filtered = filtered.filter(freelancer => 
        freelancer.hourlyRate && freelancer.hourlyRate >= parseFloat(filters.minRate)
      );
    }
    if (filters.maxRate) {
      filtered = filtered.filter(freelancer => 
        freelancer.hourlyRate && freelancer.hourlyRate <= parseFloat(filters.maxRate)
      );
    }

    // Availability filter
    if (filters.availability !== 'all') {
      filtered = filtered.filter(freelancer => freelancer.availability === filters.availability);
    }

    // Rating filter
    if (filters.minRating) {
      filtered = filtered.filter(freelancer => 
        freelancer.averageRating >= parseFloat(filters.minRating)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
        case 'oldest':
          return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
        case 'rating_high':
          return b.averageRating - a.averageRating;
        case 'rating_low':
          return a.averageRating - b.averageRating;
        case 'rate_high':
          return (b.hourlyRate || 0) - (a.hourlyRate || 0);
        case 'rate_low':
          return (a.hourlyRate || 0) - (b.hourlyRate || 0);
        default:
          return 0;
      }
    });

    setFilteredFreelancers(filtered);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const addSkillFilter = (skill: string) => {
    if (skill && !filters.skills.includes(skill)) {
      setFilters(prev => ({ ...prev, skills: [...prev.skills, skill] }));
    }
  };

  const removeSkillFilter = (skill: string) => {
    setFilters(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const clearFilters = () => {
    setFilters({
      keyword: '',
      skills: [],
      minRate: '',
      maxRate: '',
      availability: 'all',
      minRating: '',
      sortBy: 'newest'
    });
  };

  const getAllSkills = () => {
    // Use predefined skills list instead of relying on freelancer data
    const SKILL_TAGS = [
      "Web Development", "Mobile Development", "UI/UX Design", "Graphic Design",
      "Content Writing", "Digital Marketing", "Data Analysis", "Blockchain Development",
      "Smart Contract Development", "DeFi Development", "NFT Development", "Game Development",
      "Video Editing", "Photography", "Translation", "Virtual Assistant",
      "Social Media Management", "SEO", "Copywriting", "Technical Writing"
    ];
    return SKILL_TAGS;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  // 2. Add handler to open modal
  const openHireModal = (freelancer: Freelancer) => {
    setHireTarget(freelancer);
    setHireForm({
      title: '',
      description: '',
      price: freelancer.hourlyRate ? freelancer.hourlyRate.toString() : '',
      selectedTags: freelancer.skills || [],
      acceptanceDeadline: '',
      completionDeadline: ''
    });
    setHireMessage('');
    setShowHireModal(true);
  };

  // Contact chat handler
  const openContactChat = async (freelancer: Freelancer) => {
    setContactTarget(freelancer);
    setChatMessages([]);
    setNewMessage('');
    setShowContactChat(true);
    
    // Load existing chat messages
    try {
      console.log('Loading messages for employer:', { employerEmail: user?.email, freelancerEmail: freelancer.email });
      
      // Check if both emails are valid
      if (!user?.email || !freelancer.email) {
        console.error('Missing email parameters for employer:', { employerEmail: user?.email, freelancerEmail: freelancer.email });
        return;
      }
      
      const response = await fetch(`/api/chat/message?user1=${user?.email}&user2=${freelancer.email}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded messages for employer:', data.messages);
        setChatMessages(data.messages || []);
      } else {
        const errorData = await response.json();
        console.error('Failed to load messages for employer:', response.status, errorData);
      }
    } catch (error) {
      console.error('Error loading chat messages:', error);
    }
    
    // Send notification to freelancer
    try {
      const response = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: freelancer.email,
          type: 'chat_message',
          title: 'New Contact Request',
          message: `${user?.name || 'An employer'} wants to contact you about a potential project.`,
          data: {
            employerEmail: user?.email,
            employerName: user?.name,
            chatId: `${user?.email}-${freelancer.email}`
          }
        })
      });
      
      if (response.ok) {
        setMessage('Contact request sent! The freelancer will be notified.');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  // Send chat message
  const sendChatMessage = async () => {
    if (!newMessage.trim() || !contactTarget || chatSubmitting) return;

    setChatSubmitting(true);
    const messageData = {
      id: Date.now().toString(),
      text: newMessage,
      sender: user?.email,
      senderName: user?.name,
      recipient: contactTarget.email,
      recipientName: contactTarget.name,
      timestamp: new Date().toISOString(),
      isFromEmployer: true
    };

    setChatMessages(prev => [...prev, messageData]);
    setNewMessage('');

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      });

      if (response.ok) {
        // Send notification to freelancer
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientEmail: contactTarget.email,
            type: 'chat_message',
            title: 'New Message',
            message: `${user?.name || 'An employer'} sent you a message.`,
            data: {
              employerEmail: user?.email,
              employerName: user?.name,
              chatId: `${user?.email}-${contactTarget.email}`,
              messageId: messageData.id
            }
          })
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setChatSubmitting(false);
    }
  };

  // 3. Add handler for form changes
  const handleHireFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setHireForm({ ...hireForm, [e.target.name]: e.target.value });
  };

  // 4. Add handler for tag toggle
  const toggleHireTag = (tag: string) => {
    setHireForm(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter(t => t !== tag)
        : [...prev.selectedTags, tag]
    }));
  };

  // 5. Add submit handler
  const handleHireSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hireTarget) return;
    if (hireSubmitting) return;
    setHireMessage('');
    if (!hireForm.title || !hireForm.description || !hireForm.price || hireForm.selectedTags.length === 0 || !hireForm.acceptanceDeadline || !hireForm.completionDeadline) {
      setHireMessage('Please fill in all fields and select at least one skill tag');
      return;
    }
    const minRate = hireTarget.hourlyRate || 0;
    if (parseFloat(hireForm.price) < minRate) {
      setHireMessage(`Payment cannot be lower than freelancer's minimum rate ($${minRate}/hr)`);
      return;
    }
    try {
      setHireSubmitting(true);
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...hireForm,
          employerName: user.name,
          employerEmail: user.email,
          price: parseFloat(hireForm.price),
          visibility: 'private',
          directHireFreelancer: hireTarget.email
        })
      });
      const data = await response.json();
      if (response.ok) {
        setHireMessage('Direct hire task sent successfully!');
        setTimeout(() => {
          setShowHireModal(false);
        }, 1200);
      } else {
        setHireMessage(data.error || 'Failed to send direct hire task');
      }
      setHireSubmitting(false);
    } catch (error) {
      setHireMessage('Failed to send direct hire task. Please try again.');
      setHireSubmitting(false);
    }
  };

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Side Navigation */}
      <SideNavigation user={user} isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
      
      {/* Main Content Area */}
      <div className="flex-1">
        {/* Header */}
        <DashboardHeader user={user} onToggleNav={() => setIsNavOpen(true)} />
        
        {/* Browse Freelancers Content */}
        <div className="max-w-7xl mx-auto p-6">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-8 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">Browse Freelancers</h1>
                  <p className="text-white/90 text-lg">Discover talented freelancers for your projects</p>
                </div>
                <div className="flex gap-4 mt-6 md:mt-0">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex-1 md:flex-none bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30"
                  >
                    🔍 {showFilters ? 'Hide Filters' : 'Show Filters'}
                  </button>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="flex-1 md:flex-none bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30"
                  >
                    ← Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-xl mb-6 shadow-lg ${
              message.includes('successfully') 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{message.includes('successfully') ? '✅' : '❌'}</span>
                <span className="font-medium">{message}</span>
              </div>
            </div>
          )}

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Filter Freelancers</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Clear All Filters
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Keyword Search */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🔍 Keyword Search
                  </label>
                  <input
                    type="text"
                    value={filters.keyword}
                    onChange={(e) => handleFilterChange('keyword', e.target.value)}
                    placeholder="Search freelancers, skills..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                {/* Skills Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🛠️ Skills
                  </label>
                  <div className="space-y-2">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          addSkillFilter(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select a skill...</option>
                      {getAllSkills().map(skill => (
                        <option key={skill} value={skill}>{skill}</option>
                      ))}
                    </select>
                    {filters.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {filters.skills.map(skill => (
                          <span
                            key={skill}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                          >
                            {skill}
                            <button
                              onClick={() => removeSkillFilter(skill)}
                              className="text-blue-600 hover:text-blue-800 font-bold"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Rate Range */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    💰 Hourly Rate ($)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={filters.minRate}
                      onChange={(e) => handleFilterChange('minRate', e.target.value)}
                      placeholder="Min"
                      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                    <input
                      type="number"
                      value={filters.maxRate}
                      onChange={(e) => handleFilterChange('maxRate', e.target.value)}
                      placeholder="Max"
                      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🟢 Availability
                  </label>
                  <select
                    value={filters.availability}
                    onChange={(e) => handleFilterChange('availability', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="all">All</option>
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>

                {/* Min Rating */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ⭐ Minimum Rating
                  </label>
                  <select
                    value={filters.minRating}
                    onChange={(e) => handleFilterChange('minRating', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Any Rating</option>
                    <option value="4">4+ Stars</option>
                    <option value="3">3+ Stars</option>
                    <option value="2">2+ Stars</option>
                    <option value="1">1+ Stars</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📊 Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="rating_high">Highest Rating</option>
                    <option value="rating_low">Lowest Rating</option>
                    <option value="rate_high">Highest Rate</option>
                    <option value="rate_low">Lowest Rate</option>
                  </select>
                </div>
              </div>

              {/* Results Summary */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing <span className="font-semibold text-gray-900">{filteredFreelancers.length}</span> of <span className="font-semibold text-gray-900">{freelancers.length}</span> freelancers
                  </div>
                  {filters.keyword || filters.skills.length > 0 || filters.minRate || filters.maxRate || filters.availability !== 'all' || filters.minRating ? (
                    <div className="text-sm text-blue-600">
                      Filters applied
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <InlineLoading text="Loading freelancers..." />
          ) : filteredFreelancers.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {(!freelancers || freelancers.length === 0) ? 'No freelancers available' : 'No freelancers match your filters'}
              </h3>
              <p className="text-gray-600 mb-6">
                {(!freelancers || freelancers.length === 0) ? 'Check back later for new freelancers' : 'Try adjusting your filters to see more results'}
              </p>
              {(!freelancers || freelancers.length === 0) ? (
                <button
                  onClick={fetchFreelancers}
                  className="bg-gradient-to-r from-[#FFBF00] to-[#FFD700] text-black px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Refresh Freelancers
                </button>
              ) : (
                <button
                  onClick={clearFilters}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-8">
              {filteredFreelancers.map((freelancer) => (
                <div key={freelancer.email} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-[#FFBF00] to-[#FFD700] rounded-full flex items-center justify-center overflow-hidden">
                          {freelancer.profilePicture ? (
                            <img
                              src={freelancer.profilePicture}
                              alt={freelancer.name || 'Freelancer'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl font-bold text-black">
                              {freelancer.name ? freelancer.name.charAt(0).toUpperCase() : '👤'}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">{freelancer.name || 'Unknown User'}</h3>
                          <p className="text-gray-600">{freelancer.email}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex text-lg">
                              {renderStars(Math.round(freelancer.averageRating || 0))}
                            </div>
                            <span className="text-sm text-gray-600">
                              {(freelancer.averageRating || 0).toFixed(1)} ({freelancer.totalRatings || 0} reviews)
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {freelancer.bio && (
                        <p className="text-gray-700 text-lg leading-relaxed mb-6">{freelancer.bio}</p>
                      )}
                      
                      <div className="flex items-center gap-6 mb-6">
                        {freelancer.hourlyRate && (
                          <div className="bg-gradient-to-r from-[#FFBF00] to-[#FFD700] text-black px-6 py-3 rounded-xl font-bold text-2xl">
                            ${freelancer.hourlyRate}/hr
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-gray-600">
                          <span className={`w-3 h-3 rounded-full ${
                            freelancer.availability === 'available' ? 'bg-green-500' :
                            freelancer.availability === 'busy' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></span>
                          <span className="text-sm capitalize">{freelancer.availability || 'unknown'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <span className="text-lg">📅</span>
                          <span className="text-sm">Joined: {freelancer.joinedAt ? new Date(freelancer.joinedAt).toLocaleDateString() : 'Unknown'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Skills</h4>
                    <div className="flex flex-wrap gap-3">
                      {freelancer.skills && freelancer.skills.length > 0 ? (
                        freelancer.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded-full border border-blue-200"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">No skills listed</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">⭐</span>
                        <span className="font-semibold text-gray-900">Rating</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {(freelancer.averageRating || 0).toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {freelancer.totalRatings || 0} reviews
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">✅</span>
                        <span className="font-semibold text-gray-900">Completed Tasks</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {freelancer.completedTasks || 0}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">💼</span>
                        <span className="font-semibold text-gray-900">Portfolio</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {freelancer.portfolio ? freelancer.portfolio.length : 0}
                      </div>
                      <div className="text-sm text-gray-600">
                        projects
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => openHireModal(freelancer)}
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                    >
                      Hire
                    </button>
                    <button
                      onClick={() => openContactChat(freelancer)}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                    >
                      Contact Freelancer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {showHireModal && hireTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative max-h-screen overflow-y-auto">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
              onClick={() => setShowHireModal(false)}
            >×</button>
            <h2 className="text-2xl font-bold mb-4">Direct Hire: {hireTarget.name}</h2>
            <form onSubmit={handleHireSubmit} className="space-y-6">
              <div>
                <label className="block text-lg font-semibold mb-2">Task Title *</label>
                <input type="text" name="title" value={hireForm.title} onChange={handleHireFormChange} className="w-full p-3 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-lg font-semibold mb-2">Task Description *</label>
                <textarea name="description" value={hireForm.description} onChange={handleHireFormChange} className="w-full p-3 border rounded-lg" rows={4} required />
              </div>
              <div>
                <label className="block text-lg font-semibold mb-2">Payment (ETH) *</label>
                <input type="number" name="price" value={hireForm.price} onChange={handleHireFormChange} min={hireTarget.hourlyRate || 0} step="0.001" className="w-full p-3 border rounded-lg" required />
                <p className="text-sm text-gray-600 mt-1">Minimum: {hireTarget.hourlyRate ? `$${hireTarget.hourlyRate}/hr` : 'N/A'}</p>
              </div>
              <div>
                <label className="block text-lg font-semibold mb-2">Required Skills *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg bg-gray-50">
                  {SKILL_TAGS.map(tag => (
                    <label key={tag} className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                      <input
                        type="checkbox"
                        checked={hireForm.selectedTags.includes(tag)}
                        onChange={e => {
                          if (e.target.checked) {
                            setHireForm(prev => ({ ...prev, selectedTags: [...prev.selectedTags, tag] }));
                          } else {
                            setHireForm(prev => ({ ...prev, selectedTags: prev.selectedTags.filter(t => t !== tag) }));
                          }
                        }}
                        className="accent-green-500 w-4 h-4"
                      />
                      {tag}
                    </label>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1">Select one or more skills required for this task.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-lg font-semibold mb-2">Acceptance Deadline *</label>
                  <input type="datetime-local" name="acceptanceDeadline" value={hireForm.acceptanceDeadline} onChange={handleHireFormChange} className="w-full p-3 border rounded-lg" required />
                </div>
                <div>
                  <label className="block text-lg font-semibold mb-2">Completion Deadline *</label>
                  <input type="datetime-local" name="completionDeadline" value={hireForm.completionDeadline} onChange={handleHireFormChange} className="w-full p-3 border rounded-lg" required />
                </div>
              </div>
              {hireMessage && <div className={`p-3 rounded ${hireMessage.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{hireMessage}</div>}
              <button type="submit" disabled={hireSubmitting} className="w-full py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition">{hireSubmitting ? 'Sending...' : 'Send Direct Hire'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Contact Chat Modal */}
      {showContactChat && contactTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col relative">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    {contactTarget.profilePicture ? (
                      <img
                        src={contactTarget.profilePicture}
                        alt={contactTarget.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-lg font-bold text-white">
                        {contactTarget.name ? contactTarget.name.charAt(0).toUpperCase() : '👤'}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Chat with {contactTarget.name}</h3>
                    <p className="text-sm text-white/80">{contactTarget.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowContactChat(false)}
                  className="text-white hover:text-white/70 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">💬</span>
                  </div>
                  <p>Start a conversation with {contactTarget.name}</p>
                </div>
              ) : (
                chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isFromEmployer ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        message.isFromEmployer
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.timestamp || message.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
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
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendChatMessage();
                    }
                  }}
                  placeholder="Type your message..."
                  className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={chatSubmitting}
                />
                <button
                  onClick={sendChatMessage}
                  disabled={!newMessage.trim() || chatSubmitting}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {chatSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}