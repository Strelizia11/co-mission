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
}

export default function BrowseTasksPage() {
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
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader user={user} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-black">Available Tasks</h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
            >
              Back to Dashboard
            </button>
          </div>

          {message && (
            <div className={`p-3 rounded mb-4 ${
              message.includes('successfully') 
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
              <div className="text-gray-600 mb-4">No tasks available at the moment.</div>
              <button
                onClick={fetchTasks}
                className="px-4 py-2 bg-[#FFBF00] text-black rounded hover:bg-[#AE8200] transition"
              >
                Refresh Tasks
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {tasks.map((task) => {
                const matchingSkills = getMatchingSkills(task.requiredSkills);
                const matchPercentage = task.requiredSkills.length > 0 
                  ? Math.round((matchingSkills / task.requiredSkills.length) * 100)
                  : 0;

                return (
                  <div key={task.id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-black mb-2">{task.title}</h3>
                        <p className="text-gray-600 mb-2">Posted by: <span className="font-medium">{task.employerName}</span></p>
                        <p className="text-gray-700 mb-4">{task.description}</p>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-[#FFBF00]">{task.price} ETH</div>
                        <div className="text-sm text-gray-500">
                          {new Date(task.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Required Skills:</span>
                        <span className="text-sm text-gray-600">
                          {matchingSkills}/{task.requiredSkills.length} match
                          {matchPercentage > 0 && (
                            <span className="ml-2 text-green-600">({matchPercentage}%)</span>
                          )}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {task.requiredSkills.map((skill, index) => {
                          const isMatched = user?.skills?.includes(skill);
                          return (
                            <span
                              key={index}
                              className={`px-3 py-1 text-sm rounded-full ${
                                isMatched
                                  ? 'bg-green-100 text-green-800 border border-green-200'
                                  : 'bg-gray-100 text-gray-600 border border-gray-200'
                              }`}
                            >
                              {skill}
                            </span>
                          );
                        })}
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

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        Status: <span className="capitalize text-green-600">{task.status.replace('_', ' ')}</span>
                        {task.applications && (
                          <span className="ml-2 text-blue-600">
                            ({task.applications.length} application{task.applications.length !== 1 ? 's' : ''})
                          </span>
                        )}
                      </div>
                      {task.status === 'accepting_applications' && (
                        <button
                          onClick={() => handleApplyToTask(task.id)}
                          className="px-6 py-2 bg-[#FFBF00] text-black font-semibold rounded hover:bg-[#AE8200] transition"
                        >
                          Apply to Task
                        </button>
                      )}
                      {task.status !== 'accepting_applications' && (
                        <span className="px-6 py-2 bg-gray-300 text-gray-600 font-semibold rounded">
                          {task.status === 'in_progress' ? 'In Progress' : 
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
