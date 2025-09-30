"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterAnimatedPage() {
  const [step, setStep] = useState<'choice' | 'form'>('choice');
  const [role, setRole] = useState<"employer" | "freelancer" | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Slide to form
  const handleChoice = (role: "employer" | "freelancer") => {
    setRole(role);
    setForm((prev) => ({ ...prev, role }));
    setIsSliding(true);
    setTimeout(() => {
      setStep('form');
      setIsSliding(false);
    }, 400);
  };

  // Slide back to choice
  const handleBack = () => {
    setIsSliding(true);
    setTimeout(() => {
      setStep('choice');
      setMessage("");
      setIsSliding(false);
    }, 400);
  };

  // Register form logic
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(data.message);
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      } catch (_) {}
      if (data.user.role === 'freelancer') {
        window.location.href = "/auth/skills-setup";
      } else {
        window.location.href = "/dashboard";
      }
    } else {
      setMessage(data.error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4 overflow-x-hidden">
      {/* Choice Box */}
      <div
        className={`fixed inset-0 flex items-center justify-center z-10 transition-transform duration-500 ${
          step === 'choice' && !isSliding ? 'translate-x-0' : '-translate-x-full'
        } ${isSliding && step === 'form' ? '-translate-x-full' : ''}`}
        style={{ pointerEvents: step === 'choice' ? 'auto' : 'none' }}
      >
        <div
          className={`bg-white shadow-2xl rounded-lg p-10 max-w-2xl w-full text-center animate-fade-in`}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-10 text-black">
            Join Co-Mission as:
          </h1>
          <div className="flex flex-col md:flex-row gap-8 justify-center items-center mb-4">
            <button
              onClick={() => handleChoice("employer")}
              className="flex-1 flex flex-col items-center justify-center py-8 px-8 text-2xl md:text-3xl font-semibold border-4 border-gray-200 hover:border-[#FFBF00] text-black rounded-xl shadow-lg bg-white hover:bg-[#FFBF00] transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#FFBF00]/40"
            >
              <span className="text-5xl mb-3">🏢</span>
              Employer
              <span className="mt-2 text-sm md:text-base font-normal text-black/70">Post jobs, manage projects, and hire top freelancers.</span>
            </button>
            <button
              onClick={() => handleChoice("freelancer")}
              className="flex-1 flex flex-col items-center justify-center py-8 px-8 text-2xl md:text-3xl font-semibold border-4 border-gray-200 hover:border-[#FFBF00] text-black rounded-xl shadow-lg bg-white hover:bg-[#FFBF00] transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#FFBF00]/40"
            >
              <span className="text-5xl mb-3">💼</span>
              Freelancer
              <span className="mt-2 text-sm md:text-base font-normal text-black/70">Find work, grow your skills, and earn securely.</span>
            </button>
          </div>
          <p className="mt-8 text-base text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[#FFBF00] hover:underline font-semibold">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
      {/* Register Form Box */}
      <div
        className={`fixed inset-0 flex items-center justify-center z-20 transition-transform duration-500 ${
          step === 'form' && !isSliding ? 'translate-x-0' : 'translate-x-full'
        } ${isSliding && step === 'choice' ? 'translate-x-full' : ''}`}
        style={{ pointerEvents: step === 'form' ? 'auto' : 'none' }}
      >
        <div
          className={`bg-white p-10 rounded-2xl shadow-2xl w-full max-w-lg relative animate-fade-in`}
        >
          {/* Left Arrow */}
          <button
            onClick={handleBack}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-gray-100 text-gray-700 font-semibold rounded-full shadow-sm hover:bg-gray-200 hover:text-black active:bg-[#FFBF00] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/40 p-2"
            aria-label="Back"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="mb-6">
            <h2 className="text-3xl md:text-4xl font-extrabold text-center text-black mb-2">
              Register as <span className="capitalize text-[#FFBF00]">{role}</span>
            </h2>
            <p className="text-center text-gray-500 text-base mb-2">Create your account to get started</p>
          </div>

          {message && (
            <p className={`mb-4 text-center ${message.toLowerCase().includes('success') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>
          )}

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              className="w-full p-3 border-b-2 border-gray-200 focus:outline-none focus:border-[#FFBF00] text-black placeholder-gray-500 rounded-md bg-gray-50"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-3 border-b-2 border-gray-200 focus:outline-none focus:border-[#FFBF00] text-black placeholder-gray-500 rounded-md bg-gray-50"
              required
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full p-3 pr-10 border-b-2 border-gray-200 focus:outline-none focus:border-[#FFBF00] text-black placeholder-gray-500 rounded-md bg-gray-50"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 font-bold rounded-lg shadow-md transition text-lg tracking-wide ${isSubmitting ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#FFBF00] text-black hover:bg-[#AE8200]'}`}
            >
              {isSubmitting ? 'Registering...' : 'Register'}
            </button>
          </form>
        </div>
      </div>
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.7s cubic-bezier(.4,0,.2,1);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px);}
          to { opacity: 1; transform: translateY(0);}
        }
      `}</style>
    </div>
  );
}
