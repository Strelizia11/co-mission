"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "../../components/DashboardHeader";

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

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader user={user} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-black mb-6">Post a New Task</h1>
            
            {message && (
              <div className={`p-3 rounded mb-4 ${
                message.includes('successfully') 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Task Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Enter a clear, descriptive title for your task"
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-[#FFBF00] text-black placeholder-gray-500"
                  required
                />
              </div>

              {/* Task Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Description *
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Provide detailed information about what needs to be done, requirements, deliverables, etc."
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-[#FFBF00] text-black placeholder-gray-500"
                  rows={6}
                  required
                />
              </div>

              {/* Price in ETH */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full p-3 pr-12 border border-gray-300 rounded focus:outline-none focus:border-[#FFBF00] text-black placeholder-gray-500"
                    required
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    ETH
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  This amount will be held in escrow and released upon task completion
                </p>
              </div>

              {/* Required Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Required Skills *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {SKILL_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`p-2 text-sm rounded border transition ${
                        form.selectedTags.includes(tag)
                          ? 'bg-[#FFBF00] text-black border-[#FFBF00]'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-[#FFBF00]'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                {form.selectedTags.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    {form.selectedTags.length} skill{form.selectedTags.length !== 1 ? 's' : ''} selected
                  </p>
                )}
              </div>

              {/* Deadlines */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Application Deadline *
                  </label>
                  <input
                    type="datetime-local"
                    name="acceptanceDeadline"
                    value={form.acceptanceDeadline}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-[#FFBF00] text-black"
                    required
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    When freelancers can no longer apply
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Completion Deadline *
                  </label>
                  <input
                    type="datetime-local"
                    name="completionDeadline"
                    value={form.completionDeadline}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-[#FFBF00] text-black"
                    required
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    When the chosen freelancer must complete the task
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 py-3 bg-gray-300 text-gray-700 font-semibold rounded hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#FFBF00] text-black font-semibold rounded hover:bg-[#AE8200] transition"
                >
                  Post Task
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
