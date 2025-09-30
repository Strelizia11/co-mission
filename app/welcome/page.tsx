"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function WelcomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
            className="bg-[#191B1F] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#333] hover:scale-125 transition-all duration-300"
          >
            Get Started
          </Link>
        </div>
      </section>
    </main>
  );
}
