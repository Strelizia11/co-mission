"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

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

      {/* Freelancer Benefits Section */}
      <section className="px-6 py-20 bg-[#FFBF00]">
        <div className="max-w-6xl mx-auto">
          <h2
            className={`text-3xl font-bold text-center mb-12 text-black transition-all duration-700 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            Benefits for <span className="text-white drop-shadow-lg">Freelancers</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[{
              title: "Flexible Work",
              description: "Choose your own projects and work on your schedule",
              icon: "⏰"
            },
            {
              title: "Fair Payment",
              description: "Get paid what you're worth with transparent pricing",
              icon: "💰"
            },
            {
              title: "Skill Growth",
              description: "Access to diverse projects to expand your expertise",
              icon: "📈"
            },
            {
              title: "Direct Communication",
              description: "Connect directly with clients without middlemen",
              icon: "💬"
            },
            {
              title: "Portfolio Building",
              description: "Showcase your work and build your professional reputation",
              icon: "🎨"
            },
            {
              title: "Secure Payments",
              description: "Safe and reliable payment processing for all projects",
              icon: "🔒"
            }].map((benefit, idx) => (
              <div
                key={idx}
                className={`relative bg-yellow-50 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-yellow-200 hover:border-yellow-400 hover:scale-105 group ${
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
                style={{ transitionDelay: `${idx * 100 + 200}ms` }}
              >
                <div className="flex items-center justify-center mb-6">
                  <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-300 via-yellow-400 to-yellow-500 text-4xl group-hover:scale-110 transition-transform duration-300 shadow-md text-black">
                    {benefit.icon}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-[#191B1F] text-center">{benefit.title}</h3>
                <p className="text-[#191B1F] text-center">{benefit.description}</p>
              </div>
            ))}
          </div>
          
          {/* Freelancer Registration Button */}
          <div className="text-center mt-14">
            <Link
              href="auth/register/form?role=freelancer"
              className="bg-white text-[#191B1F] px-12 py-5 rounded-2xl font-extrabold shadow-xl border-4 border-yellow-400 hover:bg-[#facc15] hover:border-whitehover:text-black hover:shadow-[0_0_30px_0_rgba(0,0,0,0.25)] hover:scale-110 transition-all duration-300 inline-block tracking-wide text-lg drop-shadow-lg"
            >
              🚀 Start as a Freelancer
            </Link>
          </div>
        </div>
      </section>

      {/* Employer Benefits Section */}
      <section className="px-6 py-20 bg-gradient-to-br from-white via-yellow-50 to-white">
        <div className="max-w-6xl mx-auto">
          <h2
            className={`text-3xl font-bold text-center mb-12 text-black transition-all duration-700 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            Benefits for <span className="text-[#FFBF00]">Employers</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[{
              title: "Access to Talent",
              description: "Find skilled professionals from around the world",
              icon: "🌍"
            },
            {
              title: "Cost Effective",
              description: "Hire talent without the overhead of full-time employees",
              icon: "💡"
            },
            {
              title: "Quick Hiring",
              description: "Get started on projects faster with our streamlined process",
              icon: "⚡"
            },
            {
              title: "Quality Assurance",
              description: "Review portfolios and ratings before making decisions",
              icon: "⭐"
            },
            {
              title: "Project Management",
              description: "Track progress and communicate efficiently with freelancers",
              icon: "📊"
            },
            {
              title: "Scalable Workforce",
              description: "Scale your team up or down based on project needs",
              icon: "🔄"
            }].map((benefit, idx) => (
              <div
                key={idx}
                className={`relative bg-gray-50 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-transparent hover:border-yellow-400 hover:scale-105 group ${
                  mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
                style={{ transitionDelay: `${idx * 100 + 200}ms` }}
              >
                <div className="flex items-center justify-center mb-6">
                  <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-gray-200 via-yellow-200 to-yellow-400 text-4xl group-hover:scale-110 transition-transform duration-300 shadow-md">
                    {benefit.icon}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 text-center">{benefit.title}</h3>
                <p className="text-gray-600 text-center">{benefit.description}</p>
              </div>
            ))}
          </div>
          
          {/* Employer Registration Button */}
          <div className="text-center mt-14">
            <Link
              href="/auth/register/form?role=employer"
              className="bg-white text-[#191B1F] px-12 py-5 rounded-2xl font-extrabold shadow-xl border-4 border-[#191B1F]-400 hover:bg-[#191B1F] hover:text-white hover:shadow-[0_0_30px_0_rgba(0,0,0,0.35)] hover:border-transparent hover:scale-110 transition-all duration-300 inline-block tracking-wide text-lg drop-shadow-lg shadow-[0_0_30px_0_rgba(0,0,0,0.20)]"
            >
              🏢 Start as an Employer
            </Link>
          </div>
        </div>
      </section>

      {/* Add space before footer to prevent shifting */}
      <div className="h-12"></div>

      {/* Footer */}
      <footer className="bg-[#191B1F] text-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div
            className={`transition-all duration-700 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            {/* Main Footer Content */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              {/* Logo and Description */}
              <div className="md:col-span-1">
                <div className="flex items-center mb-4">
                  <Image
                    src="/logo.svg"
                    alt="Co-Mission Logo"
                    width={120}
                    height={40}
                    className="h-8 w-auto"
                  />
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Explore, Accept, and Earn — a platform made for freelancers and employers.
                </p>
              </div>

              {/* Push these sections to the right with compact spacing */}
              <div className="md:col-span-3 grid grid-cols-3 justify-items-end gap-2">
                {/* Freelancers */}
                <div className="w-40">
                  <h3 className="text-white font-semibold mb-4">For Freelancers</h3>
                  <ul className="space-y-2 text-sm">
                    <li><a href="#" className="text-gray-400 hover:text-white">How to Work</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white">Find Work</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white">Freelancer Services</a></li>
                  </ul>
                </div>
                
                {/* Employers */}
                <div className="w-40">
                  <h3 className="text-white font-semibold mb-4">For Employers</h3>
                  <ul className="space-y-2 text-sm">
                    <li><a href="#" className="text-gray-400 hover:text-white">How to Hire</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white">Post a Job</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white">Enterprise</a></li>
                  </ul>
                </div>
                
                {/* Support */}
                <div className="w-40">
                  <h3 className="text-white font-semibold mb-4">Support</h3>
                  <ul className="space-y-2 text-sm">
                    <li><a href="#" className="text-gray-400 hover:text-white">Contact Us</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white">Terms of Service</a></li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Social Media and Bottom Section */}
            <div className="border-t border-gray-700 pt-8">
              <div className="flex flex-row justify-between items-center">
                <div className="flex items-center gap-4">
                  <span className="text-gray-400 text-sm">Follow us:</span>
                  <a href="https://x.com/CoMission153545" className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                </div>
                <div className="text-gray-400 text-sm">
                  © {new Date().getFullYear()} Co-Mission. All rights reserved.
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
