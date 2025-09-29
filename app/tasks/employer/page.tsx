"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "../../components/DashboardHeader";

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
  applications?: Array<{
    email: string;
    name: string;
    coverLetter: string;
    appliedAt: string;
  }>;
  acceptedBy?: {
    email: string;
    name: string;
  };
  acceptedAt?: string;
  completedAt?: string;
  submittedFiles?: any[];
  submittedNotes?: string;
}

export default function EmployerTasksPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [isNavOpen, setIsNavOpen] = useState(false);

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
      const response = await fetch(`/api/tasks/${taskId}/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          freelancerEmail,
          employerEmail: user.email
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
    }
  };

  const handleCompleteTask = async (taskId: string, rating?: number, review?: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, review })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('Task marked as completed!');
        fetchTasks(); // Refresh tasks
        setShowRatingModal(false);
        setSelectedTask(null);
        setRating(5);
        setReview("");
      } else {
        setMessage(data.error || 'Failed to complete task');
      }
    } catch (error) {
      console.error('Error completing task:', error);
      setMessage('Failed to complete task');
    }
  };

  const openRatingModal = (task: any) => {
    setSelectedTask(task);
    setShowRatingModal(true);
  };

  const submitRating = () => {
    if (selectedTask) {
      handleCompleteTask(selectedTask.id, rating, review);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepting_applications': return 'bg-gray-100 text-gray-800';
      case 'accepted': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'submitted': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rated': return 'bg-green-200 text-green-900';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader user={user} onToggleNav={() => setIsNavOpen(true)} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-black">My Posted Tasks</h1>
            <div className="flex gap-4">
              <button
                onClick={() => router.push('/tasks/post')}
                className="px-4 py-2 bg-[#FFBF00] text-black rounded hover:bg-[#AE8200] transition"
              >
                Post New Task
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
              >
                Back to Dashboard
              </button>
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded mb-4 ${
              message.includes('successfully') || message.includes('completed')
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {message}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-gray-600">Loading tasks...</div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-600 mb-4">No tasks posted yet.</div>
              <button
                onClick={() => router.push('/tasks/post')}
                className="px-6 py-3 bg-[#FFBF00] text-black rounded hover:bg-[#AE8200] transition"
              >
                Post Your First Task
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {tasks.map((task) => (
                <div key={task.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-black mb-2">{task.title}</h3>
                      <p className="text-gray-700 mb-4">{task.description}</p>
                      
                      <div className="flex items-center gap-4 mb-4">
                        <div className="text-2xl font-bold text-[#FFBF00]">{task.price} ETH</div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                          {task.status.replace('_', ' ').toUpperCase()}
                        </div>
                        <div className="text-sm text-gray-500">
                          Posted: {new Date(task.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div
                        className={`h-2 rounded-full ${
                          task.status === 'accepting_applications' ? 'w-1/5 bg-gray-500' :
                          task.status === 'accepted' ? 'w-2/5 bg-yellow-500' :
                          task.status === 'in_progress' ? 'w-3/5 bg-blue-500' :
                          task.status === 'submitted' ? 'w-4/5 bg-purple-500' :
                          (task.status === 'completed' || task.status === 'rated') ? 'w-full bg-green-500' : 'w-0'
                        }`}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 mb-4">
                      <span>pending request</span>
                      <span>accepted</span>
                      <span>ongoing</span>
                      <span>completed</span>
                      <span>Rated</span>
                    </div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Required Skills:</div>
                    <div className="flex flex-wrap gap-2">
                      {task.requiredSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full border"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Application Deadline:</span>
                        <br />
                        {new Date(task.acceptanceDeadline).toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Completion Deadline:</span>
                        <br />
                        {new Date(task.completionDeadline).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Applications Section */}
                  {task.applications && task.applications.length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm font-medium text-gray-700 mb-3">
                        Applications ({task.applications.length}):
                      </div>
                      <div className="space-y-3">
                        {task.applications.map((application, index) => (
                          <div key={index} className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="font-medium text-gray-900">{application.name}</div>
                                <div className="text-sm text-gray-600">{application.email}</div>
                                <div className="text-xs text-gray-500">
                                  Applied: {new Date(application.appliedAt).toLocaleString()}
                                </div>
                              </div>
                              {task.status === 'accepting_applications' && (
                                <button
                                  onClick={() => handleSelectFreelancer(task.id, application.email)}
                                  className="px-4 py-2 bg-[#FFBF00] text-black text-sm font-semibold rounded hover:bg-[#AE8200] transition"
                                >
                                  Select
                                </button>
                              )}
                            </div>
                            {application.coverLetter && (
                              <div className="mt-2 text-sm text-gray-700">
                                <span className="font-medium">Cover Letter:</span>
                                <p className="mt-1">{application.coverLetter}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Submitted Work Section */}
                  {task.submittedFiles && task.submittedFiles.length > 0 && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                      <div className="text-sm font-medium text-blue-800 mb-2">Submitted Work:</div>
                      <div className="text-sm text-blue-700">
                        {task.submittedFiles.length} file(s) submitted
                      </div>
                      {task.submittedNotes && (
                        <div className="mt-2 text-sm text-blue-600">
                          <span className="font-medium">Notes:</span>
                          <p className="mt-1">{task.submittedNotes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {task.acceptedBy && (
                    <div className="mb-4 p-4 bg-green-50 rounded-lg">
                      <div className="text-sm font-medium text-green-800 mb-1">Accepted by:</div>
                      <div className="text-green-700">{task.acceptedBy.name}</div>
                      <div className="text-sm text-green-600">
                        Accepted on: {new Date(task.acceptedAt!).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  {task.status === 'in_progress' && task.acceptedBy && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => openRatingModal(task)}
                        className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                      >
                        Complete & Rate
                      </button>
                    </div>
                  )}

                  {task.status === 'completed' && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-sm font-medium text-blue-800">
                        Task completed on: {new Date(task.completedAt!).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Rate Freelancer: {selectedTask.acceptedBy?.name}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating (1-5 stars)
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-2xl ${
                      star <= rating ? 'text-yellow-400' : 'text-gray-300'
                    } hover:text-yellow-400`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Share your experience working with this freelancer..."
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={submitRating}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Complete & Submit Rating
              </button>
              <button
                onClick={() => {
                  setShowRatingModal(false);
                  setSelectedTask(null);
                  setRating(5);
                  setReview("");
                }}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
