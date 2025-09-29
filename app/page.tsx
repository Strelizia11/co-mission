"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check if user is logged in
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      // User is logged in, redirect to dashboard
      router.push('/dashboard');
    } else {
      // User is not logged in, redirect to welcome page
      router.push('/welcome');
    }
  }, [router]);

  // Show loading while redirecting
  if (!mounted) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#FFBF00]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-black font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#FFBF00]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
        <p className="text-black font-semibold">Redirecting...</p>
      </div>
    </div>
  );
}