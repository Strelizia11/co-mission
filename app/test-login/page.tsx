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

    function setIsLogin(arg0: boolean): void {
        throw new Error('Function not implemented.')
    }

  return (
    <div className="p-4">
<button onClick={() => setIsLogin(true)}>Login</button>
<button onClick={() => setIsLogin(false)}>Register</button>

      <pre className="mt-4">{JSON.stringify(res, null, 2)}</pre>
    </div>
  )
}
