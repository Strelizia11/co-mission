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

export default function FreelancersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profiles, setProfiles] = useState<FreelancerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filters, setFilters] = useState({
    skills: '',
    minRating: '',
    availability: ''
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/auth/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    fetchProfiles();
  }, [router]);

  const fetchProfiles = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.skills) params.append('skills', filters.skills);
      if (filters.minRating) params.append('minRating', filters.minRating);
      if (filters.availability) params.append('availability', filters.availability);

      const response = await fetch(`/api/freelancer/profiles?${params.toString()}`);
      const data = await response.json();
      
      if (response.ok) {
        setProfiles(data.profiles);
      } else {
        setMessage(data.error || 'Failed to fetch freelancer profiles');
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setMessage('Failed to fetch freelancer profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setLoading(true);
    fetchProfiles();
  };

  const clearFilters = () => {
    setFilters({ skills: '', minRating: '', availability: '' });
    setLoading(true);
    fetchProfiles();
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'unavailable': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Browse Freelancers</h1>

          {message && (
            <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-800">
              {message}
            </div>
          )}

          {/* Filters */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills
                </label>
                <input
                  type="text"
                  value={filters.skills}
                  onChange={(e) => handleFilterChange('skills', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Web Development, Design"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={filters.minRating}
                  onChange={(e) => handleFilterChange('minRating', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                  <option value="1">1+ Stars</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability
                </label>
                <select
                  value={filters.availability}
                  onChange={(e) => handleFilterChange('availability', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Any Status</option>
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
              
              <div className="flex items-end gap-2">
                <button
                  onClick={applyFilters}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Apply Filters
                </button>
                <button
                  onClick={clearFilters}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Freelancer Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <div key={profile.email} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {profile.email.split('@')[0]}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(profile.availability)}`}>
                      {profile.availability}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      {renderStars(Math.round(profile.averageRating))}
                    </div>
                    <p className="text-sm text-gray-600">
                      {profile.averageRating.toFixed(1)} ({profile.totalRatings} reviews)
                    </p>
                  </div>
                </div>

                {profile.bio && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {profile.bio}
                  </p>
                )}

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {profile.skills.slice(0, 5).map((skill, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                    {profile.skills.length > 5 && (
                      <span className="text-xs text-gray-500">
                        +{profile.skills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                {profile.hourlyRate && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Hourly Rate:</span> ${profile.hourlyRate}
                    </p>
                  </div>
                )}

                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Completed Tasks:</span> {profile.completedTasks}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Joined:</span> {new Date(profile.joinedAt).toLocaleDateString()}
                  </p>
                </div>

                {profile.portfolio.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Work</h4>
                    <div className="space-y-2">
                      {profile.portfolio.slice(0, 2).map((item) => (
                        <div key={item.id} className="text-sm">
                          <p className="font-medium text-gray-900">{item.title}</p>
                          <p className="text-gray-600 text-xs line-clamp-2">{item.description}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.technologies.slice(0, 3).map((tech, index) => (
                              <span
                                key={index}
                                className="bg-gray-100 text-gray-700 px-1 py-0.5 rounded text-xs"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // Navigate to freelancer detail page or open modal
                      console.log('View profile:', profile.email);
                    }}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => {
                      // Navigate to tasks page to hire this freelancer
                      router.push('/tasks/browse');
                    }}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                  >
                    Hire
                  </button>
                </div>
              </div>
            ))}
          </div>

          {profiles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No freelancers found matching your criteria.</p>
              <button
                onClick={clearFilters}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
