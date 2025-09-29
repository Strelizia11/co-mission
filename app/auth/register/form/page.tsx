"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function RegisterFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: role || "",
  });
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (role) {
      setForm((prev) => ({ ...prev, role }));
    }
  }, [role]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(data.message);
      // Auto-login: Save user data to localStorage and redirect immediately
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      } catch (_) {}
      // Redirect based on role without delay
      if (data.user.role === 'freelancer') {
        router.push("/auth/skills-setup");
      } else {
        router.push("/dashboard");
      }
    } else {
      setMessage(data.error);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-white pt-20 px-4">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-lg">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-gray-100 text-gray-700 font-semibold rounded-full shadow-sm hover:bg-gray-200 hover:text-black active:bg-[#FFBF00] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#FFBF00]/40"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div className="mb-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center text-black mb-2">
            Register as <span className="capitalize text-[#FFBF00]">{role}</span>
          </h2>
          <p className="text-center text-gray-500 text-base mb-2">Create your account to get started</p>
        </div>

        {message && (
          <p className="text-red-500 mb-4 text-center">{message}</p>
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
            className="w-full py-3 bg-[#FFBF00] text-black font-bold rounded-lg shadow-md hover:bg-[#AE8200] transition text-lg tracking-wide"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
