"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "../components/DashboardHeader";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you'd get this from a session/token
    // For now, we'll simulate getting user data
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    // Use window.location for more reliable redirect to welcome page
    window.location.href = '/welcome';
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <DashboardHeader user={user} />
      
      <div className="max-w-4xl mx-auto p-4">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-black">
            Welcome, {user.name}!
          </h1>
          <p className="text-gray-600">
            {user.role === 'employer' ? 'Employer' : 'Freelancer'} Dashboard
          </p>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-black">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="text-black">{user.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="text-black">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <p className="text-black capitalize">{user.role}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Member Since</label>
              <p className="text-black">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Role-specific content */}
        {user.role === 'employer' ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-black">Employer Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-black">Post a Task</h3>
                <p className="text-gray-600 text-sm">Create new tasks for freelancers with ETH payment</p>
                <button 
                  onClick={() => router.push('/tasks/post')}
                  className="mt-2 bg-[#FFBF00] text-black px-4 py-2 rounded hover:bg-[#AE8200]"
                >
                  Post Task
                </button>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-black">Manage Tasks</h3>
                <p className="text-gray-600 text-sm">View and manage your posted tasks</p>
                <button 
                  onClick={() => router.push('/tasks/employer')}
                  className="mt-2 bg-[#FFBF00] text-black px-4 py-2 rounded hover:bg-[#AE8200]"
                >
                  View Tasks
                </button>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-black">Browse Freelancers</h3>
                <p className="text-gray-600 text-sm">Find skilled freelancers for your projects</p>
                <button 
                  onClick={() => router.push('/freelancers')}
                  className="mt-2 bg-[#FFBF00] text-black px-4 py-2 rounded hover:bg-[#AE8200]"
                >
                  Browse Freelancers
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-black">Freelancer Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-black">Browse Tasks</h3>
                <p className="text-gray-600 text-sm">Find tasks that match your skills</p>
                <button 
                  onClick={() => router.push('/tasks/browse')}
                  className="mt-2 bg-[#FFBF00] text-black px-4 py-2 rounded hover:bg-[#AE8200]"
                >
                  Browse Tasks
                </button>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-black">My Accepted Tasks</h3>
                <p className="text-gray-600 text-sm">Track your accepted tasks</p>
                <button 
                  onClick={() => router.push('/tasks/freelancer')}
                  className="mt-2 bg-[#FFBF00] text-black px-4 py-2 rounded hover:bg-[#AE8200]"
                >
                  View Tasks
                </button>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-black">My Profile</h3>
                <p className="text-gray-600 text-sm">Manage your profile and portfolio</p>
                <button 
                  onClick={() => router.push('/profile')}
                  className="mt-2 bg-[#FFBF00] text-black px-4 py-2 rounded hover:bg-[#AE8200]"
                >
                  Edit Profile
                </button>
              </div>
            </div>
            
            {/* Skills Section for Freelancers */}
            {user.skills && (
              <div className="mt-6 p-4 border rounded-lg">
                <h3 className="font-semibold text-black mb-2">Your Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-[#FFBF00] text-black text-sm rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
                {user.expertise && (
                  <div className="mt-3">
                    <h4 className="font-medium text-black mb-1">Expertise:</h4>
                    <p className="text-gray-600 text-sm">{user.expertise}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Logout Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <div className="flex justify-center">
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
