"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "../components/DashboardHeader";
import SideNavigation from "../components/SideNavigation";
import { FullScreenLoading } from "../components/LoadingSpinner";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    // In a real app, you'd get this from a session/token
    // For now, we'll simulate getting user data
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      console.log('Dashboard: User data loaded:', userData);
      setUser(userData);
    } else {
      console.log('Dashboard: No user data found in localStorage');
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    // Use window.location for more reliable redirect to welcome page
    window.location.href = '/welcome';
  };

  if (loading) {
    return <FullScreenLoading text="Loading your dashboard..." />;
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Side Navigation */}
      <SideNavigation user={user} isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
      
      {/* Main Content Area */}
      <div className={`flex-1 ${isNavOpen ? '' : ''}`}>
        {/* Header */}
        <DashboardHeader user={user} onToggleNav={() => setIsNavOpen(true)} />
        
        {/* Dashboard Content */}
        <div className="max-w-7xl mx-auto p-6">
          {/* Welcome Section with Hero Design */}
          <div className="bg-gradient-to-r from-[#FFBF00] to-[#FFD700] rounded-2xl shadow-xl p-8 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            <div className="relative z-10">
              <h1 className="text-4xl font-bold text-black mb-2">
                Welcome back, {user.name}! 👋
              </h1>
              <p className="text-black/80 text-lg mb-4">
                {user.role === 'employer' ? 'Manage your projects and find talented freelancers' : 'Discover new opportunities and showcase your skills'}
              </p>
              <div className="flex items-center gap-2 text-black/70">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-sm font-medium">Last active: {new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Account Status</p>
                  <p className="text-2xl font-bold text-gray-900 capitalize">{user.role}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Member Since</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📅</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Profile Completion</p>
                  <p className="text-2xl font-bold text-gray-900">85%</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
            </div>
          </div>

          {/* User Info Card with Modern Design */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Account Information</h2>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">👤</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Full Name</p>
                    <p className="text-lg font-semibold text-gray-900">{user.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 font-semibold">📧</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Email Address</p>
                    <p className="text-lg font-semibold text-gray-900">{user.email}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 font-semibold">🎭</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Account Type</p>
                    <p className="text-lg font-semibold text-gray-900 capitalize">{user.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-orange-600 font-semibold">📅</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Member Since</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions - Navigation Items */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
              <div className="w-3 h-3 bg-[#FFBF00] rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {user.role === 'freelancer' ? (
                <>
                  <div className="group p-6 border-2 border-gray-100 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <span className="text-2xl">🔍</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Browse Tasks</h3>
                    </div>
                    <p className="text-gray-600 mb-4">Find tasks that match your skills and apply to opportunities</p>
                    <button 
                      onClick={() => router.push('/tasks/browse')}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      Browse Tasks
                    </button>
                  </div>
                  
                  <div className="group p-6 border-2 border-gray-100 rounded-xl hover:border-green-300 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                        <span className="text-2xl">📋</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">My Accepted Tasks</h3>
                    </div>
                    <p className="text-gray-600 mb-4">Track your accepted tasks and manage your work progress</p>
                    <button 
                      onClick={() => router.push('/tasks/freelancer')}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      View My Tasks
                    </button>
                  </div>
                  
                  <div className="group p-6 border-2 border-gray-100 rounded-xl hover:border-purple-300 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                        <span className="text-2xl">🏆</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Accomplished Tasks</h3>
                    </div>
                    <p className="text-gray-600 mb-4">View all your completed tasks and achievement                                    </p>
                    <button 
                      onClick={() => router.push('/tasks/accomplished')}
                      className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      My Accomplishments
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="group p-6 border-2 border-gray-100 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <span className="text-2xl">📝</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Post a Task</h3>
                    </div>
                    <p className="text-gray-600 mb-4">Create new tasks for freelancers with ETH payment</p>
                    <button 
                      onClick={() => router.push('/tasks/post')}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      Post New Task
                    </button>
                  </div>
                  
                  <div className="group p-6 border-2 border-gray-100 rounded-xl hover:border-green-300 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                        <span className="text-2xl">📊</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Manage Tasks</h3>
                    </div>
                    <p className="text-gray-600 mb-4">View and manage your posted tasks and applications</p>
                    <button 
                      onClick={() => router.push('/tasks/employer')}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      View My Tasks
                    </button>
                  </div>
                  
                  <div className="group p-6 border-2 border-gray-100 rounded-xl hover:border-purple-300 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                        <span className="text-2xl">👥</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Browse Freelancers</h3>
                    </div>
                    <p className="text-gray-600 mb-4">Discover talented freelancers with verified skills</p>
                    <button 
                      onClick={() => router.push('/freelancers')}
                      className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      Browse Freelancers
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Role-specific content */}
          {user.role === 'freelancer' && user.skills && (
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Your Skills</h2>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              
              <div className="flex flex-wrap gap-3 mb-6">
                {user.skills.map((skill: string, index: number) => (
                  <span key={index} className="px-4 py-2 bg-gradient-to-r from-[#FFBF00] to-[#FFD700] text-black text-sm rounded-full font-medium shadow-sm">
                    {skill}
                  </span>
                ))}
              </div>
              
              {user.expertise && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Expertise:</h4>
                  <p className="text-gray-700">{user.expertise}</p>
                </div>
              )}
            </div>
          )}

          {/* Logout Section */}
          <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚪</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Need to Sign Out?</h3>
              <p className="text-gray-600 mb-6">You can always come back to continue your work</p>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
