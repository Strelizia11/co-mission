"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "../../components/DashboardHeader";
import SideNavigation from "../../components/SideNavigation";

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
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
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
      fetchTasks();
    }
  }, [user]);

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
        setMessage('Application submitted successfully! The employer will review applications and select a freelancer.');
        fetchTasks(); // Refresh tasks
      } else {
        setMessage(data.error || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setMessage('Failed to submit application');
    }
  };

  const getMatchingSkills = (requiredSkills: string[]) => {
    if (!user?.skills) return 0;
    return requiredSkills.filter(skill => user.skills.includes(skill)).length;
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
                <button
                  onClick={() => router.push('/dashboard')}
                  className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30"
                >
                  ← Back to Dashboard
                </button>
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

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <div className="text-gray-600 text-lg">Loading tasks...</div>
              </div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📋</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks available</h3>
              <p className="text-gray-600 mb-6">Check back later for new opportunities</p>
              <button
                onClick={fetchTasks}
                className="bg-gradient-to-r from-[#FFBF00] to-[#FFD700] text-black px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
              >
                Refresh Tasks
              </button>
            </div>
          ) : (
            <div className="grid gap-8">
              {tasks.map((task) => {
                const matchingSkills = getMatchingSkills(task.requiredSkills);
                const matchPercentage = task.requiredSkills.length > 0 
                  ? Math.round((matchingSkills / task.requiredSkills.length) * 100)
                  : 0;

                // Check if acceptance deadline has passed
                const now = new Date();
                const acceptanceDeadline = new Date(task.acceptanceDeadline);
                const isDeadlinePassed = now > acceptanceDeadline;
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
                          className="bg-gradient-to-r from-[#FFBF00] to-[#FFD700] text-black px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                        >
                          Apply to Task
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
