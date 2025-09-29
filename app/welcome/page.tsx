"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function WelcomePage() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    // Check if user is logged in - if they are, redirect to dashboard
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      window.location.href = '/dashboard';
    }
  }, []);

  return (
    <main className="bg-white text-black min-h-screen">

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center min-h-screen bg-[#FFBF00] px-6 pt-20">
        <h1
          className={`text-5xl md:text-6xl font-extrabold mb-6 text-black transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          Welcome to <span className="text-white drop-shadow-lg">Co-Mission</span>
        </h1>
        <p
          className={`text-lg md:text-xl text-black max-w-2xl transition-all duration-700 delay-200 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          Explore, Accept, and Earn — a platform made for you.
        </p>
        <div
          className={`mt-8 flex gap-4 transition-all duration-700 delay-500 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <Link
            href="/auth/register"
            className="bg-black text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#333] hover:scale-125 transition-all duration-300"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="px-6 py-20 bg-white">
        <h2
          className={`text-3xl font-bold text-center mb-12 transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          Explore Our Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[1, 2, 3].map((i, idx) => (
            <div
              key={i}
              className={`bg-[#FFBF00] rounded-lg shadow-lg overflow-hidden flex items-center justify-center h-64 transition-all duration-700 delay-${
                idx * 200 + 300
              } ${
                mounted
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
            >
              <Image
                src={`/placeholder-${i}.jpg`}
                alt={`Feature ${i}`}
                width={400}
                height={400}
                className="object-cover w-full h-full"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 bg-[#191B1F] text-center text-white">
        <div
          className={`transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Co-Mission. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
