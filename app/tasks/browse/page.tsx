"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "../../components/DashboardHeader";
import SideNavigation from "../../components/SideNavigation";
import { InlineLoading } from "../../components/LoadingSpinner";

interface Task {
  id: string;
  title: string;
  description: string;
  price: number;
  requiredSkills: string[];
  employerName: string;
  employerEmail: string;
  status: string;
  createdAt: string;
  acceptanceDeadline: string;
  completionDeadline: string;
  applications?: any[];
}

export default function BrowseTasksPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    keyword: '',
    skills: [] as string[],
    minRate: '',
    maxRate: '',
    sortBy: 'newest' as 'newest' | 'oldest' | 'price_high' | 'price_low' | 'deadline_soon' | 'deadline_late' | 'rate_high' | 'rate_low'
  });
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [applyFeedbackByTask, setApplyFeedbackByTask] = useState<Record<string, { type: string; text: string }>>({});

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
      fetchTasks();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [tasks, filters]);

  const fetchTasks = async () => {
    try {
      console.log('Fetching tasks...');
      const response = await fetch('/api/tasks');
      const data = await response.json();
      
      console.log('Tasks response:', data);
      
      if (response.ok) {
        setTasks(data.tasks);
        console.log('Tasks loaded:', data.tasks.length);
      } else {
        setMessage('Failed to load tasks');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setMessage('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToTask = async (taskId: string) => {
    try {
      if (applyingId) return; // prevent double submit across tasks
      setApplyingId(taskId);
      const response = await fetch(`/api/tasks/${taskId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          freelancerEmail: user.email, 
          freelancerName: user.name,
          coverLetter: ''
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setApplyFeedbackByTask(prev => ({
          ...prev,
          [taskId]: { type: 'success', text: 'Application submitted successfully!' }
        }));
        fetchTasks(); // Refresh tasks
      } else {
        setApplyFeedbackByTask(prev => ({
          ...prev,
          [taskId]: { type: 'error', text: data.error || 'Failed to submit application' }
        }));
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setApplyFeedbackByTask(prev => ({
        ...prev,
        [taskId]: { type: 'error', text: 'Failed to submit application' }
      }));
    } finally {
      setApplyingId(null);
    }
  };

  const getMatchingSkills = (requiredSkills: string[]) => {
    if (!user?.skills) return 0;
    return requiredSkills.filter(skill => user.skills.includes(skill)).length;
  };

  const applyFilters = () => {
    let filtered = [...tasks];

    // Keyword filter
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(keyword) ||
        task.description.toLowerCase().includes(keyword) ||
        task.employerName.toLowerCase().includes(keyword)
      );
    }

    // Skills filter
    if (filters.skills.length > 0) {
      filtered = filtered.filter(task =>
        filters.skills.some(skill => 
          task.requiredSkills.some(requiredSkill => 
            requiredSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    }

    // Rate filter
    if (filters.minRate) {
      filtered = filtered.filter(task => task.price >= parseFloat(filters.minRate));
    }
    if (filters.maxRate) {
      filtered = filtered.filter(task => task.price <= parseFloat(filters.maxRate));
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'rate_high':
          return b.price - a.price;
        case 'rate_low':
          return a.price - b.price;
        default:
          return 0;
      }
    });

    setFilteredTasks(filtered);
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
      sortBy: 'newest'
    });
  };

  const getAllSkills = () => {
    const allSkills = new Set<string>();
    tasks.forEach(task => {
      task.requiredSkills.forEach(skill => allSkills.add(skill));
    });
    return Array.from(allSkills).sort();
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
        
        {/* Browse Tasks Content */}
        <div className="max-w-7xl mx-auto p-6">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-xl p-8 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">Available Tasks</h1>
                  <p className="text-white/90 text-lg">Discover opportunities that match your skills</p>
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
                    ← Back to Dashboard
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
                <h3 className="text-xl font-bold text-gray-900">Filter Tasks</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Clear All Filters
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Keyword Search */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🔍 Keyword Search
                  </label>
                  <input
                    type="text"
                    value={filters.keyword}
                    onChange={(e) => handleFilterChange('keyword', e.target.value)}
                    placeholder="Search tasks, employers..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                {/* Skills Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🛠️ Required Skills
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
                    💰 Rate Range (ETH)
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
                    <option value="rate_high">Highest Rate</option>
                    <option value="rate_low">Lowest Rate</option>
                  </select>
                </div>
              </div>

              {/* Results Summary */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing <span className="font-semibold text-gray-900">{filteredTasks.length}</span> of <span className="font-semibold text-gray-900">{tasks.length}</span> tasks
                  </div>
                  {filters.keyword || filters.skills.length > 0 || filters.minRate || filters.maxRate ? (
                    <div className="text-sm text-blue-600">
                      Filters applied
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )}

      {loading ? (
        <InlineLoading text="Loading tasks..." />
      ) : filteredTasks.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📋</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {tasks.length === 0 ? 'No tasks available' : 'No tasks match your filters'}
              </h3>
              <p className="text-gray-600 mb-6">
                {tasks.length === 0 ? 'Check back later for new opportunities' : 'Try adjusting your filters to see more results'}
              </p>
              {tasks.length === 0 ? (
                <button
                  onClick={fetchTasks}
                  className="bg-gradient-to-r from-[#FFBF00] to-[#FFD700] text-black px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Refresh Tasks
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
              {filteredTasks.map((task) => {
                const matchingSkills = getMatchingSkills(task.requiredSkills);
                const matchPercentage = task.requiredSkills.length > 0 
                  ? Math.round((matchingSkills / task.requiredSkills.length) * 100)
                  : 0;

                // Check if acceptance deadline has passed
                const now = new Date();
                const acceptanceDeadline = new Date(task.acceptanceDeadline);
                const isDeadlinePassed = now > acceptanceDeadline;
                const alreadyApplied = Array.isArray(task.applications) && task.applications.some((a: any) => a?.email === user?.email);
                const canApply = task.status === 'accepting_applications' && !isDeadlinePassed;

                return (
                  <div key={task.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-2xl font-bold text-gray-900">{task.title}</h3>
                          {matchPercentage > 70 && (
                            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                              🎯 Great Match
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">👤</span>
                          </div>
                          <span className="text-gray-600">Posted by <span className="font-semibold text-gray-900">{task.employerName}</span></span>
                        </div>
                        <p className="text-gray-700 text-lg leading-relaxed mb-6">{task.description}</p>
                      </div>
                      <div className="text-right ml-6">
                        <div className="bg-gradient-to-r from-[#FFBF00] to-[#FFD700] text-black px-6 py-3 rounded-xl font-bold text-2xl mb-2">
                          {task.price} ETH
                        </div>
                        <div className="text-sm text-gray-500">
                          Posted {new Date(task.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">Required Skills</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {matchingSkills}/{task.requiredSkills.length} match
                          </span>
                          {matchPercentage > 0 && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              {matchPercentage}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {task.requiredSkills.map((skill, index) => {
                          const isMatched = user?.skills?.includes(skill);
                          return (
                            <span
                              key={index}
                              className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                                isMatched
                                  ? 'bg-green-100 text-green-800 border-2 border-green-200 shadow-sm'
                                  : 'bg-gray-100 text-gray-600 border-2 border-gray-200'
                              }`}
                            >
                              {isMatched && '✓ '}{skill}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">⏰</span>
                            <span className="font-semibold text-gray-900">Application Deadline</span>
                          </div>
                          <span className={`text-lg font-medium ${isDeadlinePassed ? 'text-red-600' : 'text-gray-700'}`}>
                            {new Date(task.acceptanceDeadline).toLocaleString()}
                            {isDeadlinePassed && ' (PASSED)'}
                          </span>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">📅</span>
                            <span className="font-semibold text-gray-900">Completion Deadline</span>
                          </div>
                          <span className="text-lg font-medium text-gray-700">
                            {new Date(task.completionDeadline).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Status:</span>
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full capitalize">
                            {task.status.replace('_', ' ')}
                          </span>
                        </div>
                        {task.applications && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Applications:</span>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                              {task.applications.length}
                            </span>
                          </div>
                        )}
                      </div>
                      {canApply && (
                        <button
                          onClick={() => handleApplyToTask(task.id)}
                          disabled={!!applyingId || alreadyApplied}
                          className={`bg-gradient-to-r from-[#FFBF00] to-[#FFD700] text-black px-8 py-3 rounded-xl font-bold transition-all duration-300 ${
                            !!applyingId || alreadyApplied ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg transform hover:scale-105'
                          }`}
                        >
                          {alreadyApplied ? 'Applied' : (applyingId === task.id ? 'Applying...' : 'Apply to Task')}
                        </button>
                      )}
                      {!canApply && (
                        <span className={`px-6 py-3 font-semibold rounded-xl ${
                          isDeadlinePassed 
                            ? 'bg-red-100 text-red-600 border border-red-200' 
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          {isDeadlinePassed ? 'Application Deadline Passed' :
                           task.status === 'in_progress' ? 'In Progress' : 
                           task.status === 'completed' ? 'Completed' : 
                           task.status === 'cancelled' ? 'Cancelled' : 'Not Available'}
                        </span>
                      )}
                    </div>
                    {applyFeedbackByTask[task.id] && (
                      <div className={`mt-4 rounded-lg text-sm px-3 py-2 inline-flex items-center gap-2 ${
                        applyFeedbackByTask[task.id].type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                      }`}>
                        <span>{applyFeedbackByTask[task.id].type === 'success' ? '✅' : '❌'}</span>
                        <span>{applyFeedbackByTask[task.id].text}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
