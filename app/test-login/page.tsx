'use client'
import { useState } from 'react'

export default function TestLogin() {
  const [res, setRes] = useState<any>(null)

  async function testRegister() {
    const r = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Alice', email: 'alice@example.com', password: '123456' }),
    })
    setRes(await r.json())
  }

  async function testLogin() {
    const r = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alice@example.com', password: '123456' }),
    })
    setRes(await r.json())
  }

  return (
    <div className="p-4">
      <button onClick={testRegister} className="px-3 py-1 bg-green-500 text-white mr-2">Test Register</button>
      <button onClick={testLogin} className="px-3 py-1 bg-blue-500 text-white">Test Login</button>
      <pre className="mt-4">{JSON.stringify(res, null, 2)}</pre>
    </div>
  )
}
