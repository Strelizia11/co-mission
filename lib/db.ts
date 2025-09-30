import fs from 'fs'
import path from 'path'

const DB_FILE = path.join(process.cwd(), 'users.json')

// Portfolio item type
export type PortfolioItem = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  projectUrl?: string;
  technologies: string[];
  completedAt: string;
}

// Rating type
export type Rating = {
  id: string;
  taskId: string;
  employerEmail: string;
  employerName: string;
  rating: number; // 1-5 stars
  review: string;
  createdAt: string;
}

// Freelancer profile type
export type FreelancerProfile = {
  email: string;
  name: string;
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
  profilePicture?: string;
}

// Employer profile type
export type EmployerProfile = {
  email: string;
  companyName?: string;
  bio?: string;
  website?: string;
  location?: string;
  hiringPreferences?: string;
  joinedAt: string;
  updatedAt: string;
  postedTasks?: number;
  profilePicture?: string;
}

// User type definition
export type User = {
  name: string;
  email: string;
  password: string;
  role: 'employer' | 'freelancer';
  createdAt: string;
  walletAddress?: string;
  profile?: FreelancerProfile; // Only for freelancers
  employerProfile?: EmployerProfile; // Only for employers
}

// Read users from file
export function getUsers(): User[] {
  if (!fs.existsSync(DB_FILE)) return []
  const data = fs.readFileSync(DB_FILE, 'utf-8')
  return JSON.parse(data)
}

// Save users to file
export function saveUsers(users: User[]) {
  fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2))
}

// Get freelancer profile by email
export function getFreelancerProfile(email: string): FreelancerProfile | null {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.role === 'freelancer');
  if (!user) return null;
  
  if (user.profile) {
    return {
      ...user.profile,
      name: user.name
    };
  }
  
  return null;
}

// Update freelancer profile
export function updateFreelancerProfile(email: string, profile: Partial<FreelancerProfile>): boolean {
  console.log('updateFreelancerProfile called with:', { email, profile });
  
  const users = getUsers();
  const userIndex = users.findIndex(u => u.email === email && u.role === 'freelancer');
  
  console.log('User index:', userIndex);
  console.log('User found:', userIndex !== -1);
  
  if (userIndex === -1) return false;
  
  if (!users[userIndex].profile) {
    console.log('Creating new profile for user');
    users[userIndex].profile = {
      email,
      skills: [],
      availability: 'available',
      portfolio: [],
      ratings: [],
      averageRating: 0,
      totalRatings: 0,
      completedTasks: 0,
      joinedAt: users[userIndex].createdAt,
      updatedAt: new Date().toISOString()
    };
  }
  
  console.log('Before update - profile:', users[userIndex].profile);
  
  // Don't allow updating the name through profile updates
  const { name, ...profileWithoutName } = profile;
  
  users[userIndex].profile = {
    ...users[userIndex].profile!,
    ...profileWithoutName,
    updatedAt: new Date().toISOString()
  };
  
  console.log('After update - profile:', users[userIndex].profile);
  
  saveUsers(users);
  return true;
}

// Get employer profile by email
export function getEmployerProfile(email: string): EmployerProfile | null {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.role === 'employer');
  return user?.employerProfile || null;
}

// Update employer profile
export function updateEmployerProfile(email: string, profile: Partial<EmployerProfile>): boolean {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.email === email && u.role === 'employer');
  if (userIndex === -1) return false;

  if (!users[userIndex].employerProfile) {
    users[userIndex].employerProfile = {
      email,
      companyName: users[userIndex].name,
      bio: '',
      website: '',
      location: '',
      hiringPreferences: '',
      postedTasks: 0,
      joinedAt: users[userIndex].createdAt,
      updatedAt: new Date().toISOString(),
    };
  }

  users[userIndex].employerProfile = {
    ...users[userIndex].employerProfile!,
    ...profile,
    updatedAt: new Date().toISOString(),
  };

  saveUsers(users);
  return true;
}

// Add rating to freelancer
export function addFreelancerRating(freelancerEmail: string, rating: Rating): boolean {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.email === freelancerEmail && u.role === 'freelancer');
  
  if (userIndex === -1) return false;
  
  if (!users[userIndex].profile) {
    users[userIndex].profile = {
      email: freelancerEmail,
      skills: [],
      availability: 'available',
      portfolio: [],
      ratings: [],
      averageRating: 0,
      totalRatings: 0,
      completedTasks: 0,
      joinedAt: users[userIndex].createdAt,
      updatedAt: new Date().toISOString()
    };
  }
  
  const profile = users[userIndex].profile!;
  profile.ratings.push(rating);
  profile.totalRatings = profile.ratings.length;
  profile.averageRating = profile.ratings.reduce((sum, r) => sum + r.rating, 0) / profile.ratings.length;
  profile.updatedAt = new Date().toISOString();
  
  saveUsers(users);
  return true;
}

// Get all freelancer profiles
export function getAllFreelancerProfiles(): FreelancerProfile[] {
  const users = getUsers();
  return users
    .filter(u => u.role === 'freelancer')
    .map(u => {
      // If user has a profile, use it and add the name
      if (u.profile) {
        return {
          ...u.profile,
          name: u.name
        };
      }
      
      // If no profile exists, create a default one
      return {
        email: u.email,
        name: u.name,
        skills: [],
        availability: 'available' as 'available' | 'busy' | 'unavailable',
        portfolio: [],
        ratings: [],
        averageRating: 0,
        totalRatings: 0,
        completedTasks: 0,
        joinedAt: u.createdAt,
        updatedAt: u.createdAt,
        bio: '',
        hourlyRate: 0,
        profilePicture: ''
      };
    });
}
