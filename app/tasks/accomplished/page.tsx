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
  acceptedBy?: {
    email: string;
    name: string;
  };
  acceptedAt?: string;
  completedAt?: string;
  submittedFiles?: any[];
  submittedNotes?: string;
}

export default function AccomplishedTasksPage() {
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
      fetchAccomplishedTasks();
    }
  }, [user]);

  const fetchAccomplishedTasks = async () => {
    try {
      const response = await fetch(`/api/tasks/freelancer?email=${encodeURIComponent(user.email)}&status=completed`);
      const data = await response.json();
      
      if (response.ok) {
        setTasks(data.tasks);
      } else {
        setMessage('Failed to load accomplished tasks');
      }
    } catch (error) {
      console.error('Error fetching accomplished tasks:', error);
      setMessage('Failed to load accomplished tasks');
    } finally {
      setLoading(false);
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
      <div className={`flex-1`}>
        {/* Header */}
        <DashboardHeader user={user} onToggleNav={() => setIsNavOpen(true)} />
        
        {/* Accomplished Tasks Content */}
        <div className="max-w-7xl mx-auto p-6">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl shadow-xl p-8 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">My Accomplishments</h1>
                  <p className="text-white/90 text-lg">Celebrate your completed tasks and achievements</p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => router.push('/tasks/browse')}
                    className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30"
                  >
                    Browse More Tasks
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
              message.includes('successfully') || message.includes('loaded')
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{message.includes('successfully') || message.includes('loaded') ? '✅' : '❌'}</span>
                <span className="font-medium">{message}</span>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <div className="text-gray-600 text-lg">Loading your accomplishments...</div>
              </div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🏆</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No accomplishments yet</h3>
              <p className="text-gray-600 mb-6">Complete some tasks to see your achievements here</p>
              <button
                onClick={() => router.push('/tasks/browse')}
                className="bg-gradient-to-r from-[#FFBF00] to-[#FFD700] text-black px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
              >
                Browse Available Tasks
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
                        <div className="px-4 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                          ✅ COMPLETED
                        </div>
                      </div>
                      <p className="text-gray-700 text-lg leading-relaxed mb-6">{task.description}</p>
                      
                      <div className="flex items-center gap-6 mb-6">
                        <div className="bg-gradient-to-r from-[#FFBF00] to-[#FFD700] text-black px-6 py-3 rounded-xl font-bold text-2xl">
                          {task.price} ETH
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <span className="text-lg">🎉</span>
                          <span className="text-sm">Completed: {new Date(task.completedAt!).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">👤</span>
                        <span className="font-semibold text-gray-900">Employer</span>
                      </div>
                      <div className="text-gray-700 font-medium">{task.employerName}</div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">📅</span>
                        <span className="font-semibold text-gray-900">Accepted Date</span>
                      </div>
                      <div className="text-gray-700 font-medium">
                        {new Date(task.acceptedAt!).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">⏱️</span>
                        <span className="font-semibold text-gray-900">Duration</span>
                      </div>
                      <div className="text-gray-700 font-medium">
                        {(() => {
                          const accepted = new Date(task.acceptedAt!);
                          const completed = new Date(task.completedAt!);
                          const diffTime = completed.getTime() - accepted.getTime();
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
                        })()}
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Skills Used</h4>
                    <div className="flex flex-wrap gap-3">
                      {task.requiredSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-purple-100 text-purple-800 text-sm font-medium rounded-full border border-purple-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">🎉</span>
                      <h4 className="text-lg font-semibold text-green-900">Task Completed Successfully!</h4>
                    </div>
                    <div className="text-green-800 mb-2">
                      Congratulations! You successfully completed this task and earned {task.price} ETH.
                    </div>
                    <div className="text-sm text-green-700 bg-green-100 px-3 py-2 rounded-lg inline-block">
                      ✅ Payment released on: {new Date(task.completedAt!).toLocaleDateString()}
                    </div>
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
