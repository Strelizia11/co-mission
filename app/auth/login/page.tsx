'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [message, setMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        setMessage(data.message)
        localStorage.setItem('user', JSON.stringify(data.user))
        // keep button disabled while redirecting to avoid double submits
        window.location.href = '/dashboard'
      } else {
        setMessage(data.error)
      }
    } catch (error) {
      setMessage('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-white px-4">
      <div className="bg-white/90 backdrop-blur-md p-10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.25),0_1.5px_8px_0_rgba(255,191,0,0.10)] w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold text-black mb-2 tracking-tight">
            Welcome Back!
          </h2>
          <p className="text-gray-600">Please enter your details</p>
        </div>

        {message && (
          <p className={`mb-4 text-center ${message.toLowerCase().includes('success') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>
        )}

        <form className="flex flex-col gap-5" onSubmit={handleSubmit} autoComplete="off">
          {/* Email Field */}
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full p-3 border-b-2 border-gray-200 focus:outline-none focus:border-[#FFBF00] text-black placeholder-gray-500 rounded-md bg-gray-50"
            required
          />

          {/* Password Field */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
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
            disabled={isLoading}
            className={`w-full py-3 font-bold rounded-lg transition ${
              isLoading
                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                : 'bg-[#FFBF00] hover:bg-[#AE8200] text-black shadow-md hover:scale-[1.03]'
            } text-lg tracking-wide`}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-8 text-sm text-center space-y-2">
          <p>
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-[#FFBF00] hover:underline font-semibold">
              Register here
            </Link>
          </p>
          <p>
            <Link href="/reset-password" className="text-gray-500 hover:underline">
              Forgot your password?
            </Link>
          </p>
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
  )
}
