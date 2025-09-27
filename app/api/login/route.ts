export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import * as bcrypt from 'bcryptjs'
import { getUsers } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    console.log('Login attempt for email:', email)

    if (!email || !password) {
      console.log('Missing fields:', { email: !!email, password: !!password })
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const users = getUsers()
    console.log('Total users in database:', users.length)
    console.log('Available emails:', users.map(u => u.email))
    
    const user = users.find(u => u.email === email)
    if (!user) {
      console.log('User not found for email:', email)
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    console.log('User found:', { name: user.name, email: user.email, role: user.role })
    
    const isPasswordCorrect = await bcrypt.compare(password, user.password)
    console.log('Password correct:', isPasswordCorrect)
    
    if (!isPasswordCorrect) {
      console.log('Incorrect password for user:', email)
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    console.log('Login successful for user:', user.email)
    return NextResponse.json({ 
      message: 'Login successful', 
      user: { 
        name: user.name, 
        email: user.email, 
        role: user.role,
        createdAt: user.createdAt 
      } 
    })
  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
