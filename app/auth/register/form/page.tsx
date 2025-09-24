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
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(data.message);
      router.push("/auth/login");
    } else {
      setMessage(data.error);
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 pt-20 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">
          Register as{" "}
          <span className="capitalize text-[#FFBF00]">{role}</span>
        </h2>

        {message && (
          <p className="text-red-500 mb-4 text-center">{message}</p>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-2 border-b border-gray-300 focus:outline-none focus:border-[#FFBF00] text-black placeholder-gray-500"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full p-2 border-b border-gray-300 focus:outline-none focus:border-[#FFBF00] text-black placeholder-gray-500"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full p-2 border-b border-gray-300 focus:outline-none focus:border-[#FFBF00] text-black placeholder-gray-500"
            required
          />

          <button
            type="submit"
            className="w-full py-2 bg-[#FFBF00] text-black font-semibold rounded hover:bg-[#AE8200] transition"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
