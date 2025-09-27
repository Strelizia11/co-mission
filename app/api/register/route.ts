import { NextResponse } from 'next/server'
import * as bcrypt from 'bcryptjs'
import { getUsers, saveUsers } from '@/lib/db'

export async function POST(req: Request) {
  const { name, email, password, role } = await req.json()

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 })
  }

  // Validate role if provided
  if (role && !['employer', 'freelancer'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role. Must be employer or freelancer' }, { status: 400 })
  }

  try {
    const users = getUsers()
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Add new user
    const newUser = {
      name,
      email,
      password: hashedPassword,
      role: role || 'freelancer', // Default to freelancer if no role specified
      createdAt: new Date().toISOString()
    }

    users.push(newUser)
    saveUsers(users)

    return NextResponse.json({ 
      message: 'User registered successfully!',
      user: { name, email, role: newUser.role }
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
