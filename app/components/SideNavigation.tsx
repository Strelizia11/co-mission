"use client";

import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

interface SideNavigationProps {
  user: {
    name: string;
    role: string;
  };
  isOpen?: boolean;
  onClose?: () => void;
}

export default function SideNavigation({ user, isOpen = false, onClose }: SideNavigationProps) {
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
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay sidebar (all screen sizes) with open/close transitions */}
      <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => onClose && onClose()}
        />
        {/* Panel */}
        <div className={`absolute left-0 top-0 h-full w-64 md:w-[35vw] bg-[#FFBF00] shadow-2xl border-r-2 border-black transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform ease-out duration-300 will-change-transform`}
        >
          <div className="h-full flex flex-col">
            {/* Header with close */}
            <div className="p-6 border-b-2 border-black flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-black">
                  {user.role === 'employer' ? 'Employer' : 'Freelancer'} Tools
                </h2>
                <p className="text-sm text-black/70 mt-1">Welcome back, {user.name}!</p>
              </div>
              <button
                aria-label="Close menu"
                onClick={() => onClose && onClose()}
                className="text-black hover:text-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFBF00] rounded-md"
              >
                ✕
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {/* Dashboard button */}
                <button
                  onClick={() => handleNavigation('/dashboard')}
                  role="link"
                  className="w-full flex items-center p-4 text-left rounded-lg transition-all duration-200 hover:bg-black/10 hover:-translate-x-0.5 border border-black/20 hover:border-black/40 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFBF00] group"
                >
                  <span className="text-2xl mr-4 transition-transform duration-200 group-hover:translate-x-0.5">🏠</span>
                  <div>
                    <div className="font-semibold text-black text-lg group-hover:text-black">Dashboard</div>
                    <div className="text-sm text-black/70">Overview and quick actions</div>
                  </div>
                </button>

                {tools.map((tool, index) => {
                  const isActive = pathname === tool.href;
                  const base = 'w-full flex items-center p-4 text-left rounded-lg transition-all duration-200 hover:-translate-x-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFBF00] group';
                  const activeClasses = ' bg-black/20 border border-black/40 shadow-md';
                  const hoverClasses = ' hover:bg-black/10 border border-black/20 hover:border-black/40 hover:shadow-md';
                  const classes = `${base}${isActive ? activeClasses : hoverClasses}`;
                  return (
                    <button
                      key={index}
                      onClick={() => handleNavigation(tool.href)}
                      role="link"
                      className={classes}
                    >
                      <span className="text-2xl mr-4 transition-transform duration-200 group-hover:translate-x-0.5">{tool.icon}</span>
                      <div>
                        <div className="font-semibold text-black text-lg group-hover:text-black">{tool.name}</div>
                        <div className="text-sm text-black/70">{tool.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer pinned bottom */}
            <div className="p-6 border-t-2 border-black">
              <button
                onClick={() => { handleLogout(); onClose && onClose(); }}
                className="w-full flex items-center p-4 text-left hover:bg-red-500/20 rounded-lg transition-all duration-200 text-red-700 border border-red-500/30 hover:border-red-500/50 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFBF00]"
              >
                <span className="text-2xl mr-4">🚪</span>
                <div>
                  <div className="font-semibold text-lg">Logout</div>
                  <div className="text-sm text-red-600">Sign out of your account</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
