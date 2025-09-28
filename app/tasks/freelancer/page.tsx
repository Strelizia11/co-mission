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
  acceptedBy?: {
    email: string;
    name: string;
  };
  acceptedAt?: string;
  completedAt?: string;
}

export default function FreelancerTasksPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

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

  const handleSubmitWork = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ freelancerEmail: user.email })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('Work submitted successfully! Waiting for employer approval.');
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
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader user={user} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-black">My Accepted Tasks</h1>
            <div className="flex gap-4">
              <button
                onClick={() => router.push('/tasks/browse')}
                className="px-4 py-2 bg-[#FFBF00] text-black rounded hover:bg-[#AE8200] transition"
              >
                Browse More Tasks
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
              message.includes('successfully') || message.includes('submitted')
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
              <div className="text-gray-600 mb-4">No accepted tasks yet.</div>
              <button
                onClick={() => router.push('/tasks/browse')}
                className="px-6 py-3 bg-[#FFBF00] text-black rounded hover:bg-[#AE8200] transition"
              >
                Browse Available Tasks
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
                          Accepted: {new Date(task.acceptedAt!).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Employer:</div>
                    <div className="text-gray-600">{task.employerName}</div>
                  </div>

                  <div className="mb-4">
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

                  {task.status === 'in_progress' && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleSubmitWork(task.id)}
                        className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                      >
                        Submit Work
                      </button>
                    </div>
                  )}

                  {task.status === 'submitted' && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-sm font-medium text-blue-800">
                        Work submitted! Waiting for employer approval.
                      </div>
                    </div>
                  )}

                  {task.status === 'completed' && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-sm font-medium text-green-800">
                        Task completed! Payment will be released.
                      </div>
                      <div className="text-sm text-green-600">
                        Completed on: {new Date(task.completedAt!).toLocaleDateString()}
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
