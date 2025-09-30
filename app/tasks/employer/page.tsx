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
  acceptedBy?: {
    email: string;
    name: string;
  };
  acceptedAt?: string;
  completedAt?: string;
}

export default function EmployerTasksPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [selectingId, setSelectingId] = useState<string | null>(null);

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
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/tasks/employer?email=${encodeURIComponent(user.email)}`);
      const data = await response.json();
      
      if (response.ok) {
        setTasks(data.tasks);
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

  const handleSelectFreelancer = async (taskId: string, freelancerEmail: string) => {
    try {
      if (selectingId) return;
      setSelectingId(taskId);
      const response = await fetch(`/api/tasks/${taskId}/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          employerEmail: user.email,
          freelancerEmail: freelancerEmail
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('Freelancer selected successfully!');
        fetchTasks(); // Refresh tasks
      } else {
        setMessage(data.error || 'Failed to select freelancer');
      }
    } catch (error) {
      console.error('Error selecting freelancer:', error);
      setMessage('Failed to select freelancer');
    } finally {
      setSelectingId(null);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      setMessage('Processing payment...');
      
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          employerEmail: user.email
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        if (data.paymentInitiated) {
          setMessage('Task completed and payment initiated! Check your transaction history.');
        } else {
          setMessage('Task marked as completed!');
        }
        fetchTasks(); // Refresh tasks
      } else {
        setMessage(data.error || 'Failed to complete task');
      }
    } catch (error) {
      console.error('Error completing task:', error);
      setMessage('Failed to complete task');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepting_applications': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
        
        {/* My Posted Tasks Content */}
        <div className="max-w-7xl mx-auto p-6">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl shadow-xl p-8 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">My Posted Tasks</h1>
                  <p className="text-white/90 text-lg">Manage your tasks and review applications</p>
                </div>
                <div className="flex gap-4 mt-6 md:mt-0">
                  <button
                    onClick={() => router.push('/tasks/post')}
                    className="flex-1 md:flex-none bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30"
                  >
                    ➕ Post New Task
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
              message.includes('successfully') || message.includes('completed')
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{message.includes('successfully') || message.includes('completed') ? '✅' : '❌'}</span>
                <span className="font-medium">{message}</span>
              </div>
            </div>
          )}

          {loading ? (
            <InlineLoading text="Loading your tasks..." />
          ) : tasks.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📝</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks posted yet</h3>
              <p className="text-gray-600 mb-6">Start by posting your first task to find talented freelancers</p>
              <button
                onClick={() => router.push('/tasks/post')}
                className="bg-gradient-to-r from-[#FFBF00] to-[#FFD700] text-black px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
              >
                Post Your First Task
              </button>
            </div>
          ) : (
            <div className="grid gap-8">
              {tasks.map((task) => (
                <div key={task.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-2xl font-bold text-gray-900">{task.title}</h3>
                        <div className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(task.status)}`}>
                          {task.status.replace('_', ' ').toUpperCase()}
                        </div>
                      </div>
                      <p className="text-gray-700 text-lg leading-relaxed mb-6">{task.description}</p>
                      
                      <div className="flex items-center gap-6 mb-6">
                        <div className="bg-gradient-to-r from-[#FFBF00] to-[#FFD700] text-black px-6 py-3 rounded-xl font-bold text-2xl">
                          {task.price} ETH
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <span className="text-lg">📅</span>
                          <span className="text-sm">Posted: {new Date(task.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">⏰</span>
                        <span className="font-semibold text-gray-900">Application Deadline</span>
                      </div>
                      <div className="text-gray-700 font-medium">
                        {new Date(task.acceptanceDeadline).toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🎯</span>
                        <span className="font-semibold text-gray-900">Completion Deadline</span>
                      </div>
                      <div className="text-gray-700 font-medium">
                        {new Date(task.completionDeadline).toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">📊</span>
                        <span className="font-semibold text-gray-900">Applications</span>
                      </div>
                      <div className="text-gray-700 font-medium">
                        {task.applications?.length || 0} application{(task.applications?.length || 0) !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Required Skills</h4>
                    <div className="flex flex-wrap gap-3">
                      {task.requiredSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded-full border border-blue-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Applications Section */}
                  {task.applications && task.applications.length > 0 && (
                    <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="text-xl">👥</span>
                        Applications ({task.applications.length})
                      </h4>
                      <div className="space-y-4">
                        {task.applications.map((application, index) => (
                          <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-semibold text-gray-900">{application.name}</h5>
                                <p className="text-sm text-gray-600">{application.email}</p>
                                {application.coverLetter && (
                                  <p className="text-sm text-gray-700 mt-2">{application.coverLetter}</p>
                                )}
                              </div>
                              {task.status === 'accepting_applications' && (
                                <button
                                  onClick={() => handleSelectFreelancer(task.id, application.email)}
                                  disabled={!!selectingId}
                                  className={`px-4 py-2 text-sm font-semibold rounded transition ${selectingId ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg'}`}
                                >
                                  {selectingId === task.id ? 'Selecting...' : 'Select'}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Selected Freelancer */}
                  {task.acceptedBy && (
                    <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="text-xl">✅</span>
                        Selected Freelancer
                      </h4>
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-semibold text-gray-900">{task.acceptedBy.name}</h5>
                            <p className="text-sm text-gray-600">{task.acceptedBy.email}</p>
                            <p className="text-sm text-gray-500">Selected: {new Date(task.acceptedAt!).toLocaleDateString()}</p>
                          </div>
                          {task.status === 'in_progress' && (
                            <button
                              onClick={() => handleCompleteTask(task.id)}
                              className="bg-gradient-to-r from-[#FFBF00] to-[#FFD700] text-black px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                            >
                              Complete & Pay ({task.price} ETH)
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Task Completed */}
                  {task.status === 'completed' && (
                    <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🎉</span>
                        <div>
                          <h4 className="text-lg font-semibold text-green-900">Task Completed!</h4>
                          <p className="text-green-800">Completed on: {new Date(task.completedAt!).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}