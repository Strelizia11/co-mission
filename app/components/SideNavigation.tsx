"use client";

import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import TokenBalance from "./TokenBalance";

interface SideNavigationProps {
  user?: {
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

  const role = user?.role === 'employer' ? 'employer' : 'freelancer';
  const tools = role === 'employer' ? employerTools : freelancerTools;

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
          className={`absolute inset-0 bg-gray-900/80 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => onClose && onClose()}
        />
        {/* Panel */}
        <div className={`absolute left-0 top-0 h-full w-80 sm:w-96 md:w-[35vw] lg:w-80 bg-[#FFFFFF] shadow-2xl border-r-2 border-black transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform ease-out duration-300 will-change-transform`}
        >
          <div className="h-full flex flex-col">
            {/* Header with close */}
            <div className="p-4 sm:p-6 border-b-2 border-black flex items-center justify-between bg-black relative overflow-hidden">
              {/* Abstract geometric background pattern */}
              <div className="absolute inset-0 opacity-30">
                <svg className="w-full h-full" viewBox="0 0 400 200" fill="none" preserveAspectRatio="xMidYMid slice">
                  {/* Large U-shaped element */}
                  <path d="M360 160 L360 120 L320 120 L320 80 L280 80 L280 120 L240 120 L240 160 L360 160 Z" stroke="#FFBF00" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  
                  {/* Small circle */}
                  <circle cx="350" cy="90" r="4" fill="#FFBF00"/>
                  
                  {/* Chevron arrows */}
                  <path d="M300 140 L290 150 L300 160" stroke="#FFBF00" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M280 130 L270 140 L280 150" stroke="#FFBF00" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M260 120 L250 130 L260 140" stroke="#FFBF00" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  
                  {/* Parallel diagonal lines */}
                  <path d="M40 40 L80 80" stroke="#FFBF00" strokeWidth="3" strokeLinecap="round"/>
                  <path d="M60 30 L100 70" stroke="#FFBF00" strokeWidth="3" strokeLinecap="round"/>
                  <path d="M80 20 L120 60" stroke="#FFBF00" strokeWidth="3" strokeLinecap="round"/>
                  <path d="M100 10 L140 50" stroke="#FFBF00" strokeWidth="3" strokeLinecap="round"/>
                  
                  {/* Additional geometric elements */}
                  <path d="M160 60 L200 100 L240 60 L200 20 Z" stroke="#FFBF00" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20 160 L60 200" stroke="#FFBF00" strokeWidth="3" strokeLinecap="round"/>
                  <path d="M30 150 L70 190" stroke="#FFBF00" strokeWidth="3" strokeLinecap="round"/>
                  
                  {/* Circuit-like elements */}
                  <path d="M50 50 L70 50 L70 70 L90 70" stroke="#FFBF00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="70" cy="50" r="3" fill="#FFBF00"/>
                  <circle cx="70" cy="70" r="3" fill="#FFBF00"/>
                </svg>
              </div>
              
              <div className="relative z-10">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  {role === 'employer' ? 'Employer' : 'Freelancer'} Tools
                </h2>
                <p className="text-xs sm:text-sm text-white/70 mt-1">Welcome back, {user?.name || 'User'}!</p>
              </div>
              <button
                aria-label="Close menu"
                onClick={() => onClose && onClose()}
                className="text-white hover:text-white/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-md relative z-10"
              >
                ✕
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="space-y-3">
                {/* Dashboard button */}
                <button
                  onClick={() => handleNavigation('/dashboard')}
                  role="link"
                  className="w-full flex items-center p-4 text-left rounded-lg transition-all duration-200 hover:bg-black/10 hover:-translate-x-0.5 border border-black/20 hover:border-black/40 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFBF00] group"
                >
                  <span className="text-2xl mr-4 transition-transform duration-200 group-hover:translate-x-0.5">🏠</span>
                  <div>
                    <div className="font-semibold text-black text-base sm:text-lg group-hover:text-black">Dashboard</div>
                    <div className="text-xs sm:text-sm text-black/70">Overview and quick actions</div>
                  </div>
                </button>

                {tools.map((tool, index) => {
                  const isActive = pathname === tool.href;
                  const base = 'w-full flex items-center p-4 text-left rounded-lg transition-all duration-200 hover:-translate-x-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFBF00] group';
                  const activeClasses = ' bg-black/20 border border-black/40 shadow-md';
                  const hoverClasses = ' hover:bg-black/10 border border-black/20 hover:border-black/40 hover:shadow-md';
                  const classes = `${base}${isActive ? activeClasses : hoverClasses}`;
                  
                  // Add TokenBalance after the first 2 tools (index 1)
                  const shouldShowTokenBalance = index === 1;
                  
                  return (
                    <div key={index}>
                      <button
                        onClick={() => handleNavigation(tool.href)}
                        role="link"
                        className={classes}
                      >
                        <span className="text-2xl mr-4 transition-transform duration-200 group-hover:translate-x-0.5">{tool.icon}</span>
                        <div>
                          <div className="font-semibold text-black text-base sm:text-lg group-hover:text-black">{tool.name}</div>
                          <div className="text-xs sm:text-sm text-black/70">{tool.description}</div>
                        </div>
                      </button>
                      
                      {shouldShowTokenBalance && (
                        <div className="mb-4">
                          <TokenBalance className="w-full" userEmail={user?.email} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer pinned bottom */}
            <div className="p-4 sm:p-6 border-t-2 border-black">
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
