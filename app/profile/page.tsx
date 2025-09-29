"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "../components/DashboardHeader";
import SideNavigation from "../components/SideNavigation";
import { InlineLoading } from "../components/LoadingSpinner";

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
  minimumRate?: number;
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
  const [employerProfile, setEmployerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<'profile' | 'portfolio' | 'ratings'>('profile');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    skills: [] as string[],
    minimumRate: '',
    availability: 'available' as 'available' | 'busy' | 'unavailable'
  });
  const [employerForm, setEmployerForm] = useState({
    companyName: '',
    bio: '',
    website: '',
    location: '',
    hiringPreferences: ''
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
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/auth/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    if (parsedUser.role === 'freelancer') {
      fetchProfile(parsedUser.email);
    } else {
      fetchEmployer(parsedUser.email);
    }
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
          minimumRate: data.profile.minimumRate?.toString() || '',
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

  const fetchEmployer = async (email: string) => {
    try {
      const response = await fetch(`/api/employer/profile?email=${email}`);
      const data = await response.json();
      if (response.ok) {
        setEmployerProfile(data.profile);
        setEmployerForm({
          companyName: data.profile.companyName || '',
          bio: data.profile.bio || '',
          website: data.profile.website || '',
          location: data.profile.location || '',
          hiringPreferences: data.profile.hiringPreferences || ''
        });
      } else {
        setMessage(data.error || 'Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching employer profile:', error);
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
          minimumRate: formData.minimumRate ? parseFloat(formData.minimumRate) : undefined
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

  const handleUpdateEmployerProfile = async () => {
    try {
      const response = await fetch('/api/employer/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          ...employerForm,
        })
      });
      const data = await response.json();
      if (response.ok) {
        setEmployerProfile(data.profile);
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
    return <InlineLoading text="Loading your profile..." />;
  }

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">Access denied</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Side Navigation */}
      <SideNavigation user={user} isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
      
      {/* Main Content Area */}
      <div className={`flex-1`}>
        {/* Header */}
        <DashboardHeader user={user} onToggleNav={() => setIsNavOpen(true)} />
        
        {/* Profile Content */}
        <div className="max-w-7xl mx-auto p-6">
          {/* Page Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl shadow-xl p-8 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">My Profile</h1>
                  <p className="text-white/90 text-lg">{user.role === 'freelancer' ? 'Manage your professional profile and showcase your work' : 'Manage your company profile and hiring preferences'}</p>
                </div>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30"
                  >
                    ✏️ Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            {message && (
              <div className={`mb-6 p-4 rounded-xl shadow-lg ${
                message.includes('success') ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{message.includes('success') ? '✅' : '❌'}</span>
                  <span className="font-medium">{message}</span>
                </div>
              </div>
            )}

            {/* Tab Navigation */}
            {user.role === 'freelancer' ? (
              <div className="flex space-x-2 mb-8 bg-gray-100 p-2 rounded-xl">
                {['profile', 'portfolio', 'ratings'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-6 py-3 rounded-lg font-semibold capitalize transition-all duration-300 ${
                      activeTab === tab
                        ? 'bg-white text-purple-600 shadow-md'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    {tab === 'profile' && '👤 '}
                    {tab === 'portfolio' && '💼 '}
                    {tab === 'ratings' && '⭐ '}
                    {tab}
                  </button>
                ))}
              </div>
            ) : null}

          {/* Profile Tab */}
          {user.role === 'freelancer' && activeTab === 'profile' && (
              <div className="space-y-8">
                {editing ? (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="text-xl">📝</span>
                        Personal Information
                      </h3>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Bio
                        </label>
                        <textarea
                          value={formData.bio}
                          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          rows={4}
                          placeholder="Tell us about yourself, your experience, and what makes you unique..."
                        />
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="text-xl">🛠️</span>
                        Skills & Expertise
                      </h3>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Your Skills
                        </label>
                        <div className="flex flex-wrap gap-3 mb-4">
                          {formData.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 border border-green-200"
                            >
                              {skill}
                              <button
                                onClick={() => removeSkill(skill)}
                                className="text-green-600 hover:text-green-800 font-bold"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                            className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                            placeholder="Add a skill (e.g., React, Python, Design)..."
                          />
                          <button
                            onClick={addSkill}
                            className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all duration-200 font-semibold"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="text-xl">💰</span>
                        Pricing & Availability
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Minimum Rate ($)
                          </label>
                          <input
                            type="number"
                            value={formData.minimumRate}
                            onChange={(e) => setFormData(prev => ({ ...prev, minimumRate: e.target.value }))}
                            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                            placeholder="e.g., 25"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Availability
                          </label>
                          <select
                            value={formData.availability}
                            onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value as any }))}
                            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                          >
                            <option value="available">🟢 Available</option>
                            <option value="busy">🟡 Busy</option>
                            <option value="unavailable">🔴 Unavailable</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                      <button
                        onClick={handleUpdateProfile}
                        className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
                      >
                        💾 Save Changes
                      </button>
                      <button
                        onClick={() => setEditing(false)}
                        className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-3 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
                      >
                        ❌ Cancel
                      </button>
                    </div>
                </div>
                ) : (
                  <div className="space-y-8">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="text-xl">📝</span>
                        Bio
                      </h3>
                      <p className="text-gray-700 text-lg leading-relaxed">{profile?.bio || 'No bio provided'}</p>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="text-xl">🛠️</span>
                        Skills
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {profile?.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium border border-green-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <span className="text-xl">💰</span>
                          Minimum Rate
                        </h3>
                        <p className="text-2xl font-bold text-gray-900">${profile?.minimumRate || 'Not set'}</p>
                      </div>
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <span className="text-xl">🟢</span>
                          Availability
                        </h3>
                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                          profile?.availability === 'available' ? 'bg-green-100 text-green-800 border border-green-200' :
                          profile?.availability === 'busy' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                          'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {profile?.availability}
                        </span>
                      </div>
                      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <span className="text-xl">⭐</span>
                          Rating
                        </h3>
                        <div className="flex items-center gap-3">
                          <div className="flex text-2xl">
                            {renderStars(Math.round(profile?.averageRating || 0))}
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-gray-900">
                              {profile?.averageRating?.toFixed(1) || '0.0'}
                            </div>
                            <div className="text-sm text-gray-600">
                              ({profile?.totalRatings || 0} reviews)
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          {/* Portfolio Tab */}
          {user.role === 'freelancer' && activeTab === 'portfolio' && (
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
          {user.role === 'freelancer' && activeTab === 'ratings' && (
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
          {/* Employer Profile Content */}
          {user.role === 'employer' && (
            <div className="space-y-8">
              {editing ? (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="text-xl">🏢</span>
                      Company Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name</label>
                        <input
                          type="text"
                          value={employerForm.companyName}
                          onChange={(e) => setEmployerForm(prev => ({ ...prev, companyName: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Your company or display name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Website</label>
                        <input
                          type="url"
                          value={employerForm.website}
                          onChange={(e) => setEmployerForm(prev => ({ ...prev, website: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                        <input
                          type="text"
                          value={employerForm.location}
                          onChange={(e) => setEmployerForm(prev => ({ ...prev, location: e.target.value }))}
                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="City, Country"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">About / Bio</label>
                        <textarea
                          value={employerForm.bio}
                          onChange={(e) => setEmployerForm(prev => ({ ...prev, bio: e.target.value }))}
                          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={4}
                          placeholder="Tell freelancers about your company or yourself as an employer"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Hiring Preferences</label>
                        <textarea
                          value={employerForm.hiringPreferences}
                          onChange={(e) => setEmployerForm(prev => ({ ...prev, hiringPreferences: e.target.value }))}
                          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={3}
                          placeholder="e.g., preferred skills, communication style, timezone, budget range, etc."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button
                      onClick={handleUpdateEmployerProfile}
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
                    >
                      💾 Save Changes
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-3 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
                    >
                      ❌ Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="text-xl">🏢</span>
                      Company Profile
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="text-sm text-gray-600">Company Name</div>
                        <div className="text-lg font-semibold text-gray-900">{employerProfile?.companyName || user.name}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Website</div>
                        <div className="text-lg font-semibold text-gray-900 break-all">{employerProfile?.website || 'Not set'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Location</div>
                        <div className="text-lg font-semibold text-gray-900">{employerProfile?.location || 'Not set'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Member Since</div>
                        <div className="text-lg font-semibold text-gray-900">{employerProfile?.joinedAt ? new Date(employerProfile.joinedAt).toLocaleDateString() : new Date(user.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="mt-6">
                      <div className="text-sm text-gray-600 mb-1">About / Bio</div>
                      <p className="text-gray-700">{employerProfile?.bio || 'No bio provided'}</p>
                    </div>
                    <div className="mt-6">
                      <div className="text-sm text-gray-600 mb-1">Hiring Preferences</div>
                      <p className="text-gray-700">{employerProfile?.hiringPreferences || 'No preferences specified'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="text-xl">📦</span>
                        Posted Tasks
                      </h3>
                      <p className="text-2xl font-bold text-gray-900">{employerProfile?.postedTasks ?? 0}</p>
                    </div>
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="text-xl">📧</span>
                        Contact Email
                      </h3>
                      <p className="text-lg font-semibold text-gray-900 break-all">{user.email}</p>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="text-xl">🔗</span>
                        Website
                      </h3>
                      <p className="text-lg font-semibold text-gray-900 break-all">{employerProfile?.website || 'Not set'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
