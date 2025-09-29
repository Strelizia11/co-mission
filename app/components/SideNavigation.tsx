"use client";

import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

interface SideNavigationProps {
  user: {
    name: string;
    role: string;
  };
}

export default function SideNavigation({ user }: SideNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/welcome';
  };

  const freelancerTools = [
    {
      name: "My Profile",
      description: "Manage your profile and portfolio",
      href: "/profile",
      icon: "👤"
    },
    {
      name: "Transaction History",
      description: "View your payment history",
      href: "/transactions",
      icon: "💳"
    }
  ];

  const employerTools = [
    {
      name: "My Profile",
      description: "Manage your profile and portfolio",
      href: "/profile",
      icon: "👤"
    },
    {
      name: "Transaction History",
      description: "View your payment history",
      href: "/transactions",
      icon: "💳"
    }
  ];

  const tools = user.role === 'employer' ? employerTools : freelancerTools;

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-[#FFBF00] shadow-2xl z-40 border-r-2 border-black">
      {/* Navigation Header */}
      <div className="p-6 border-b-2 border-black">
        <div>
          <h2 className="text-xl font-bold text-black">
            {user.role === 'employer' ? 'Employer' : 'Freelancer'} Tools
          </h2>
          <p className="text-sm text-black/70 mt-1">
            Welcome back, {user.name}!
          </p>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-3">
          {tools.map((tool, index) => {
            const isActive = pathname === tool.href;
            return (
              <button
                key={index}
                onClick={() => handleNavigation(tool.href)}
                className={`w-full flex items-center p-4 text-left rounded-lg transition-all duration-200 border ${
                  isActive 
                    ? 'bg-black/20 border-black/40 shadow-md' 
                    : 'hover:bg-black/10 border-black/20 hover:border-black/40 hover:shadow-md'
                }`}
              >
                <span className="text-2xl mr-4">{tool.icon}</span>
                <div>
                  <div className="font-semibold text-black text-lg">{tool.name}</div>
                  <div className="text-sm text-black/70">{tool.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer with Logout */}
      <div className="p-6 border-t-2 border-black">
        <button
          onClick={handleLogout}
          className="w-full flex items-center p-4 text-left hover:bg-red-500/20 rounded-lg transition-all duration-200 text-red-700 border border-red-500/30 hover:border-red-500/50 hover:shadow-md"
        >
          <span className="text-2xl mr-4">🚪</span>
          <div>
            <div className="font-semibold text-lg">Logout</div>
            <div className="text-sm text-red-600">Sign out of your account</div>
          </div>
        </button>
      </div>
    </div>
  );
}
