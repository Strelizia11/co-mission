"use client";

import { ConnectWallet } from "@coinbase/onchainkit/wallet";
import Image from "next/image";
import { useState } from "react";

interface DashboardHeaderProps {
  user: {
    name: string;
    role: string;
  };
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="flex justify-between items-center p-4 bg-[#191B1F] shadow-md">
      {/* Logo */}
      <div className="flex-shrink-0">
        <Image
          style={{ marginLeft: "10px", padding: "15px" }}
          src="/logo.svg"
          alt="Co-Mission Logo"
          width={250}
          height={250}
        />
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center">
        <ConnectWallet />
      </div>

      {/* Mobile menu button */}
      <div className="md:hidden">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
        >
          <span className="sr-only">Open main menu</span>
          <svg
            className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg
            className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="absolute top-16 right-4 bg-[#191B1F] rounded-lg shadow-lg p-4 z-50">
          <div className="mb-4">
            <ConnectWallet />
          </div>
        </div>
      )}
    </header>
  );
}
