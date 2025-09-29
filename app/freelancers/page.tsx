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

  const fetchFreelancers = async () => {
    try {
      const response = await fetch('/api/freelancer/profiles');
      const data = await response.json();
      
      if (response.ok) {
        setFreelancers(data.freelancers);
      } else {
        setMessage('Failed to load freelancers');
      }
    } catch (error) {
      console.error('Error fetching freelancers:', error);
      setMessage('Failed to load freelancers');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...freelancers];

    // Keyword filter
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      filtered = filtered.filter(freelancer => 
        freelancer.name.toLowerCase().includes(keyword) ||
        freelancer.bio?.toLowerCase().includes(keyword) ||
        freelancer.skills.some(skill => skill.toLowerCase().includes(keyword))
      );
    }

    // Skills filter
    if (filters.skills.length > 0) {
      filtered = filtered.filter(freelancer =>
        filters.skills.some(skill => 
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
    const allSkills = new Set<string>();
    freelancers.forEach(freelancer => {
      freelancer.skills.forEach(skill => allSkills.add(skill));
    });
    return Array.from(allSkills).sort();
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ));
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
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">Browse Freelancers</h1>
                  <p className="text-white/90 text-lg">Discover talented freelancers for your projects</p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30"
                  >
                    🔍 {showFilters ? 'Hide Filters' : 'Show Filters'}
                  </button>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30"
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
                {freelancers.length === 0 ? 'No freelancers available' : 'No freelancers match your filters'}
              </h3>
              <p className="text-gray-600 mb-6">
                {freelancers.length === 0 ? 'Check back later for new freelancers' : 'Try adjusting your filters to see more results'}
              </p>
              {freelancers.length === 0 ? (
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
                        <div className="w-16 h-16 bg-gradient-to-r from-[#FFBF00] to-[#FFD700] rounded-full flex items-center justify-center">
                          <span className="text-2xl font-bold text-black">
                            {freelancer.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">{freelancer.name}</h3>
                          <p className="text-gray-600">{freelancer.email}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex text-lg">
                              {renderStars(Math.round(freelancer.averageRating))}
                            </div>
                            <span className="text-sm text-gray-600">
                              {freelancer.averageRating.toFixed(1)} ({freelancer.totalRatings} reviews)
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
                          <span className="text-sm capitalize">{freelancer.availability}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <span className="text-lg">📅</span>
                          <span className="text-sm">Joined: {new Date(freelancer.joinedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Skills</h4>
                    <div className="flex flex-wrap gap-3">
                      {freelancer.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded-full border border-blue-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">⭐</span>
                        <span className="font-semibold text-gray-900">Rating</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {freelancer.averageRating.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {freelancer.totalRatings} reviews
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">✅</span>
                        <span className="font-semibold text-gray-900">Completed Tasks</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {freelancer.completedTasks}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">💼</span>
                        <span className="font-semibold text-gray-900">Portfolio</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {freelancer.portfolio.length}
                      </div>
                      <div className="text-sm text-gray-600">
                        projects
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        // In a real app, this would open a contact modal or navigate to a contact page
                        setMessage(`Contact information for ${freelancer.name} would be displayed here`);
                      }}
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
    </div>
  );
}