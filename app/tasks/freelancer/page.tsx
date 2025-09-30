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
  acceptedBy?: {
    email: string;
    name: string;
  };
  acceptedAt?: string;
  completedAt?: string;
  submittedFiles?: any[];
  submittedNotes?: string;
}

export default function FreelancerTasksPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [submissionNotes, setSubmissionNotes] = useState("");
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
      const response = await fetch(`/api/tasks/freelancer?email=${encodeURIComponent(user.email)}`);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleSubmitWork = async (taskId: string) => {
    try {
      // For now, we'll simulate file upload by converting files to base64
      // In a real application, you'd upload to a file storage service
      const files = await Promise.all(
        selectedFiles.map(async (file) => ({
          name: file.name,
          size: file.size,
          type: file.type,
          content: await file.text() // This is a simplified approach
        }))
      );

      const response = await fetch(`/api/tasks/${taskId}/submit-work`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          freelancerEmail: user.email,
          files: files,
          notes: submissionNotes
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('Work submitted successfully! Waiting for employer approval.');
        setSelectedFiles([]);
        setSubmissionNotes("");
        fetchTasks(); // Refresh tasks
      } else {
        setMessage(data.error || 'Failed to submit work');
      }
    } catch (error) {
      console.error('Error submitting work:', error);
      setMessage('Failed to submit work');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
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
      <div className={`flex-1`}>
        {/* Header */}
        <DashboardHeader user={user} onToggleNav={() => setIsNavOpen(true)} />
        
        {/* Accepted Tasks Content */}
        <div className="max-w-7xl mx-auto p-6">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-xl p-8 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">My Accepted Tasks</h1>
                  <p className="text-white/90 text-lg">Track your progress and manage your work</p>
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
              message.includes('successfully') || message.includes('submitted')
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{message.includes('successfully') || message.includes('submitted') ? '✅' : '❌'}</span>
                <span className="font-medium">{message}</span>
              </div>
            </div>
          )}

              {loading ? (
                <InlineLoading text="Loading your tasks..." />
              ) : tasks.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📋</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No accepted tasks yet</h3>
              <p className="text-gray-600 mb-6">Start by browsing available tasks and applying to ones that match your skills</p>
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
                          <span className="text-sm">Accepted: {new Date(task.acceptedAt!).toLocaleDateString()}</span>
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
                        <span className="font-semibold text-gray-900">Completion Deadline</span>
                      </div>
                      <div className="text-gray-700 font-medium">
                        {new Date(task.completionDeadline).toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">⏰</span>
                        <span className="font-semibold text-gray-900">Time Remaining</span>
                      </div>
                      <div className={`font-medium ${
                        (() => {
                          const now = new Date();
                          const deadline = new Date(task.completionDeadline);
                          const diff = deadline.getTime() - now.getTime();
                          const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                          return days <= 0 ? 'text-red-600' : days <= 3 ? 'text-yellow-600' : 'text-gray-700';
                        })()
                      }`}>
                        {(() => {
                          const now = new Date();
                          const deadline = new Date(task.completionDeadline);
                          const diff = deadline.getTime() - now.getTime();
                          const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                          return days > 0 ? `${days} day(s)` : 'Overdue';
                        })()}
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

                  {task.status === 'in_progress' && (
                    <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">📤</span>
                        <h4 className="text-lg font-semibold text-gray-900">Submit Your Work</h4>
                      </div>
                      
                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Upload Files
                        </label>
                        <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                          <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                            id={`file-upload-${task.id}`}
                          />
                          <label 
                            htmlFor={`file-upload-${task.id}`}
                            className="cursor-pointer block"
                          >
                            <span className="text-4xl mb-2 block">📁</span>
                            <span className="text-gray-600 font-medium">Click to upload files</span>
                            <span className="text-gray-500 text-sm block mt-1">or drag and drop</span>
                          </label>
                        </div>
                        {selectedFiles.length > 0 && (
                          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                            <div className="text-sm font-medium text-blue-800 mb-2">Selected Files:</div>
                            <div className="text-sm text-blue-700">
                              {selectedFiles.map(f => f.name).join(', ')}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Additional Notes (Optional)
                        </label>
                        <textarea
                          value={submissionNotes}
                          onChange={(e) => setSubmissionNotes(e.target.value)}
                          placeholder="Add any additional notes about your work..."
                          className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-black placeholder-gray-500"
                          rows={4}
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={() => handleSubmitWork(task.id)}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                          Submit Work
                        </button>
                      </div>
                    </div>
                  )}

                  {task.status === 'submitted' && (
                    <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">⏳</span>
                        <h4 className="text-lg font-semibold text-blue-900">Work Submitted</h4>
                      </div>
                      <div className="text-blue-800 mb-3">
                        Your work has been submitted and is waiting for employer review.
                      </div>
                      {task.submittedFiles && task.submittedFiles.length > 0 && (
                        <div className="text-sm text-blue-700 bg-blue-100 px-3 py-2 rounded-lg inline-block">
                          📁 {task.submittedFiles.length} file(s) submitted
                        </div>
                      )}
                    </div>
                  )}

                  {task.status === 'completed' && (
                    <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">🎉</span>
                        <h4 className="text-lg font-semibold text-green-900">Task Completed!</h4>
                      </div>
                      <div className="text-green-800 mb-2">
                        Congratulations! Your work has been approved and payment will be released.
                      </div>
                      <div className="text-sm text-green-700 bg-green-100 px-3 py-2 rounded-lg inline-block">
                        ✅ Completed on: {new Date(task.completedAt!).toLocaleDateString()}
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

