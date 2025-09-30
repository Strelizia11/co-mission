"use client";

import { useState, useEffect } from "react";
import ChatWidget from "./ChatWidget";
import MessagesWidget from "./MessagesWidget";

interface User {
  name: string;
  role: string;
  email: string;
  skills?: string[];
}

export default function FloatingWidgets() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    // Get current page from pathname
    const pathname = window.location.pathname;
    if (pathname.includes('/tasks')) {
      setCurrentPage('tasks');
    } else if (pathname.includes('/freelancers')) {
      setCurrentPage('freelancers');
    } else if (pathname.includes('/profile')) {
      setCurrentPage('profile');
    } else {
      setCurrentPage('dashboard');
    }
  }, []);

  return (
    <>
      <MessagesWidget user={user || undefined} />
      <ChatWidget user={user || undefined} currentPage={currentPage} />
    </>
  );
}
