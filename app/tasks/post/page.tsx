"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "../../components/DashboardHeader";
import SideNavigation from "../../components/SideNavigation";
import { FullScreenLoading } from "../../components/LoadingSpinner";

const SKILL_TAGS = [
  "Web Development", "Mobile Development", "UI/UX Design", "Graphic Design",
  "Content Writing", "Digital Marketing", "Data Analysis", "Blockchain Development",
  "Smart Contract Development", "DeFi Development", "NFT Development", "Game Development",
  "Video Editing", "Photography", "Translation", "Virtual Assistant",
  "Social Media Management", "SEO", "Copywriting", "Technical Writing"
];

export default function PostTaskPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    selectedTags: [] as string[],
    acceptanceDeadline: "",
    completionDeadline: ""
  });
  const [message, setMessage] = useState("");

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
    setLoading(false);
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleTag = (tag: string) => {
    setForm(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter(t => t !== tag)
        : [...prev.selectedTags, tag]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title || !form.description || !form.price || form.selectedTags.length === 0 || !form.acceptanceDeadline || !form.completionDeadline) {
      setMessage("Please fill in all fields and select at least one skill tag");
      return;
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          employerName: user.name,
          employerEmail: user.email,
          price: parseFloat(form.price)
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage("Task posted successfully!");
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        setMessage(data.error || "Failed to post task");
      }
    } catch (error) {
      console.error('Error posting task:', error);
      setMessage("Failed to post task. Please try again.");
    }
  };

  if (loading) {
    return <FullScreenLoading text="Loading post task form..." />;
  }

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
        
        {/* Post Task Content */}
        <div className="max-w-4xl mx-auto p-6">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-xl p-8 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">Post a New Task</h1>
                  <p className="text-white/90 text-lg">Create opportunities for talented freelancers</p>
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

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            
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

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Task Title */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <label className="block text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">📝</span>
                  Task Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Enter a clear, descriptive title for your task"
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-black placeholder-gray-500"
                  required
                />
              </div>

              {/* Task Description */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                <label className="block text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">📋</span>
                  Task Description *
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Provide detailed information about what needs to be done, requirements, deliverables, etc."
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-black placeholder-gray-500"
                  rows={6}
                  required
                />
              </div>

              {/* Price in ETH */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                <label className="block text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">💰</span>
                  Price (ETH) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="0.1"
                    step="0.001"
                    min="0"
                    className="w-full p-4 pr-16 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 text-black placeholder-gray-500"
                    required
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                    ETH
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2 bg-yellow-100 px-3 py-2 rounded-lg">
                  💡 This amount will be held in escrow and released upon task completion
                </p>
              </div>

              {/* Required Skills */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <label className="block text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-xl">🛠️</span>
                  Required Skills *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {SKILL_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`p-3 text-sm font-medium rounded-xl border-2 transition-all duration-200 ${
                        form.selectedTags.includes(tag)
                          ? 'bg-[#FFBF00] text-black border-[#FFBF00] shadow-md transform scale-105'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:bg-green-50'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                {form.selectedTags.length > 0 && (
                  <div className="mt-4 p-3 bg-green-100 rounded-lg">
                    <p className="text-sm font-medium text-green-800">
                      ✅ {form.selectedTags.length} skill{form.selectedTags.length !== 1 ? 's' : ''} selected
                    </p>
                  </div>
                )}
              </div>

              {/* Deadlines */}
              <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6 border border-red-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-xl">⏰</span>
                  Task Deadlines *
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Application Deadline
                    </label>
                    <input
                      type="datetime-local"
                      name="acceptanceDeadline"
                      value={form.acceptanceDeadline}
                      onChange={handleChange}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-black"
                      required
                    />
                    <p className="text-sm text-gray-600 mt-2 bg-red-100 px-3 py-2 rounded-lg">
                      📅 When freelancers can no longer apply
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Completion Deadline
                    </label>
                    <input
                      type="datetime-local"
                      name="completionDeadline"
                      value={form.completionDeadline}
                      onChange={handleChange}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-black"
                      required
                    />
                    <p className="text-sm text-gray-600 mt-2 bg-red-100 px-3 py-2 rounded-lg">
                      🎯 When the chosen freelancer must complete the task
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-6 pt-6">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  ❌ Cancel
                </button>
                <button
                  type="submit"
                  disabled={!form.title || !form.description || !form.price || form.selectedTags.length === 0 || !form.acceptanceDeadline || !form.completionDeadline}
                  className="flex-1 py-4 bg-gradient-to-r from-[#FFBF00] to-[#FFD700] text-black font-semibold rounded-xl hover:shadow-lg transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🚀 Post Task
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
