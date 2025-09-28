"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const SKILLS = [
  "Web Development", "Mobile Development", "UI/UX Design", "Graphic Design",
  "Content Writing", "Digital Marketing", "Data Analysis", "Blockchain Development",
  "Smart Contract Development", "DeFi Development", "NFT Development", "Game Development",
  "Video Editing", "Photography", "Translation", "Virtual Assistant",
  "Social Media Management", "SEO", "Copywriting", "Technical Writing"
];

export default function SkillsSetupPage() {
  const router = useRouter();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [expertise, setExpertise] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      router.push('/auth/login');
    }
  }, [router]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedSkills.length === 0) {
      alert("Please select at least one skill");
      return;
    }

    // Update user with skills and expertise
    const updatedUser = {
      ...user,
      skills: selectedSkills,
      expertise: expertise,
      skillsSetupComplete: true
    };

    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Redirect to dashboard
    router.push("/dashboard");
  };

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 pt-20 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-center text-black mb-2">
            Welcome, {user.name}!
          </h2>
          <p className="text-center text-gray-600">
            Let's set up your skills and expertise to help you find the perfect tasks.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Skills Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select your skills (choose all that apply):
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {SKILLS.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`p-2 text-sm rounded border transition ${
                    selectedSkills.includes(skill)
                      ? 'bg-[#FFBF00] text-black border-[#FFBF00]'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-[#FFBF00]'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
            {selectedSkills.length > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                {selectedSkills.length} skill{selectedSkills.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          {/* Expertise Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tell us about your expertise and experience:
            </label>
            <textarea
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              placeholder="Describe your experience, years in the field, notable projects, etc."
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-[#FFBF00] text-black placeholder-gray-500"
              rows={4}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#FFBF00] text-black font-semibold rounded hover:bg-[#AE8200] transition"
            disabled={selectedSkills.length === 0}
          >
            Complete Setup
          </button>
        </form>
      </div>
    </div>
  );
}
