export const runtime = 'node'

import { NextResponse } from 'next/server'
import * as bcrypt from 'bcryptjs'
import { getUsers } from '@/lib/db'

export async function POST(req: Request) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const users = getUsers()
  const user = users.find(u => u.email === email)
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password)
  if (!isPasswordCorrect) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  return NextResponse.json({ message: 'Login successful', user: { name: user.name, email: user.email } })
}
