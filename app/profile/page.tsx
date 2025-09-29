"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "../components/DashboardHeader";

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  projectUrl?: string;
  technologies: string[];
  completedAt: string;
}

interface Rating {
  id: string;
  taskId: string;
  employerEmail: string;
  employerName: string;
  rating: number;
  review: string;
  createdAt: string;
}

interface FreelancerProfile {
  email: string;
  bio?: string;
  skills: string[];
  hourlyRate?: number;
  availability: 'available' | 'busy' | 'unavailable';
  portfolio: PortfolioItem[];
  ratings: Rating[];
  averageRating: number;
  totalRatings: number;
  completedTasks: number;
  joinedAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<'profile' | 'portfolio' | 'ratings'>('profile');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    skills: [] as string[],
    hourlyRate: '',
    availability: 'available' as 'available' | 'busy' | 'unavailable'
  });
  const [newPortfolioItem, setNewPortfolioItem] = useState({
    title: '',
    description: '',
    imageUrl: '',
    projectUrl: '',
    technologies: [] as string[],
    completedAt: ''
  });
  const [newSkill, setNewSkill] = useState('');
  const [newTech, setNewTech] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/auth/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    if (parsedUser.role !== 'freelancer') {
      router.push('/dashboard');
      return;
    }
    
    fetchProfile(parsedUser.email);
  }, [router]);

  const fetchProfile = async (email: string) => {
    try {
      const response = await fetch(`/api/freelancer/profile?email=${email}`);
      const data = await response.json();
      
      if (response.ok) {
        setProfile(data.profile);
        setFormData({
          bio: data.profile.bio || '',
          skills: data.profile.skills || [],
          hourlyRate: data.profile.hourlyRate?.toString() || '',
          availability: data.profile.availability || 'available'
        });
      } else {
        setMessage(data.error || 'Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await fetch('/api/freelancer/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          ...formData,
          hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setProfile(data.profile);
        setEditing(false);
        setMessage('Profile updated successfully!');
      } else {
        setMessage(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile');
    }
  };

  const handleAddPortfolioItem = async () => {
    try {
      const response = await fetch('/api/freelancer/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          portfolioItem: newPortfolioItem
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setNewPortfolioItem({
          title: '',
          description: '',
          imageUrl: '',
          projectUrl: '',
          technologies: [],
          completedAt: ''
        });
        setNewTech('');
        fetchProfile(user.email);
        setMessage('Portfolio item added successfully!');
      } else {
        setMessage(data.error || 'Failed to add portfolio item');
      }
    } catch (error) {
      console.error('Error adding portfolio item:', error);
      setMessage('Failed to add portfolio item');
    }
  };

  const handleDeletePortfolioItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/freelancer/portfolio?email=${user.email}&itemId=${itemId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        fetchProfile(user.email);
        setMessage('Portfolio item deleted successfully!');
      } else {
        setMessage(data.error || 'Failed to delete portfolio item');
      }
    } catch (error) {
      console.error('Error deleting portfolio item:', error);
      setMessage('Failed to delete portfolio item');
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addTech = () => {
    if (newTech.trim() && !newPortfolioItem.technologies.includes(newTech.trim())) {
      setNewPortfolioItem(prev => ({
        ...prev,
        technologies: [...prev.technologies, newTech.trim()]
      }));
      setNewTech('');
    }
  };

  const removeTech = (tech: string) => {
    setNewPortfolioItem(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }));
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!user || user.role !== 'freelancer') {
    return <div className="flex justify-center items-center min-h-screen">Access denied</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Edit Profile
              </button>
            )}
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded-lg ${
              message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {message}
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6">
            {['profile', 'portfolio', 'ratings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-lg font-medium capitalize ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skills
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                        >
                          {skill}
                          <button
                            onClick={() => removeSkill(skill)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Add a skill..."
                      />
                      <button
                        onClick={addSkill}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hourly Rate ($)
                    </label>
                    <input
                      type="number"
                      value={formData.hourlyRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 25"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Availability
                    </label>
                    <select
                      value={formData.availability}
                      onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value as any }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="available">Available</option>
                      <option value="busy">Busy</option>
                      <option value="unavailable">Unavailable</option>
                    </select>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={handleUpdateProfile}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Bio</h3>
                    <p className="text-gray-700">{profile?.bio || 'No bio provided'}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile?.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Hourly Rate</h3>
                      <p className="text-gray-700">${profile?.hourlyRate || 'Not set'}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Availability</h3>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        profile?.availability === 'available' ? 'bg-green-100 text-green-800' :
                        profile?.availability === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {profile?.availability}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Rating</h3>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {renderStars(Math.round(profile?.averageRating || 0))}
                        </div>
                        <span className="text-gray-700">
                          ({profile?.totalRatings || 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Portfolio Tab */}
          {activeTab === 'portfolio' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Portfolio Item</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={newPortfolioItem.title}
                      onChange={(e) => setNewPortfolioItem(prev => ({ ...prev, title: e.target.value }))}
                      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Project Title"
                    />
                    <input
                      type="date"
                      value={newPortfolioItem.completedAt}
                      onChange={(e) => setNewPortfolioItem(prev => ({ ...prev, completedAt: e.target.value }))}
                      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <textarea
                    value={newPortfolioItem.description}
                    onChange={(e) => setNewPortfolioItem(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Project Description"
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="url"
                      value={newPortfolioItem.imageUrl}
                      onChange={(e) => setNewPortfolioItem(prev => ({ ...prev, imageUrl: e.target.value }))}
                      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Image URL"
                    />
                    <input
                      type="url"
                      value={newPortfolioItem.projectUrl}
                      onChange={(e) => setNewPortfolioItem(prev => ({ ...prev, projectUrl: e.target.value }))}
                      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Project URL"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Technologies Used
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {newPortfolioItem.technologies.map((tech, index) => (
                        <span
                          key={index}
                          className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                        >
                          {tech}
                          <button
                            onClick={() => removeTech(tech)}
                            className="text-green-600 hover:text-green-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTech}
                        onChange={(e) => setNewTech(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTech()}
                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Add a technology..."
                      />
                      <button
                        onClick={addTech}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddPortfolioItem}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Add Portfolio Item
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Items</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {profile?.portfolio.map((item) => (
                    <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                      )}
                      <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                      <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.technologies.map((tech, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          {new Date(item.completedAt).toLocaleDateString()}
                        </span>
                        <div className="flex gap-2">
                          {item.projectUrl && (
                            <a
                              href={item.projectUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              View Project
                            </a>
                          )}
                          <button
                            onClick={() => handleDeletePortfolioItem(item.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {profile?.portfolio.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No portfolio items yet. Add your first project above!</p>
                )}
              </div>
            </div>
          )}

          {/* Ratings Tab */}
          {activeTab === 'ratings' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {profile?.averageRating.toFixed(1) || '0.0'}
                </div>
                <div className="flex justify-center mb-2">
                  {renderStars(Math.round(profile?.averageRating || 0))}
                </div>
                <p className="text-gray-600">
                  Based on {profile?.totalRatings || 0} review{profile?.totalRatings !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="space-y-4">
                {profile?.ratings.map((rating) => (
                  <div key={rating.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{rating.employerName}</h4>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {renderStars(rating.rating)}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(rating.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 mt-2">{rating.review}</p>
                  </div>
                ))}
                
                {profile?.ratings.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No ratings yet. Complete some tasks to get reviews!</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
