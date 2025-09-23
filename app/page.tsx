'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [message, setMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (res.ok) {
      setMessage(data.message)
      router.push('/auth/login') // redirect after registration
    } else {
      setMessage(data.error)
    }
  }

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 pt-20">
      <div className="bg-white p-8 rounded-lg shadow-md shadow-black/30 w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-black">Register</h2>

        {message && <p className="text-red-500 mb-4 text-center">{message}</p>}

        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          {/* Underlined Inputs */}
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-2 border-b-2 border-gray-400 focus:outline-none focus:border-[#FFBF00] text-black placeholder-gray-500"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full p-2 border-b-2 border-gray-400 focus:outline-none focus:border-[#FFBF00] text-black placeholder-gray-500"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full p-2 border-b-2 border-gray-400 focus:outline-none focus:border-[#FFBF00] text-black placeholder-gray-500"
            required
          />

          {/* Fixed Button */}
          <Link href={"/auth/register"}>
          <button
            type="submit"
            className="w-full bg-[#FFBF00] text-black font-semibold py-2 rounded-lg hover:bg-[#AE8200] transition duration-300"
          >
            Register
          </button>
          </Link>
        </form>

        <p className="mt-6 text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link href="../auth/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
