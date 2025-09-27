import { NextResponse } from 'next/server'
import * as bcrypt from 'bcryptjs'
import { getUsers, saveUsers } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { email, newPassword } = await req.json()
    
    if (!email || !newPassword) {
      return NextResponse.json({ error: 'Email and new password are required' }, { status: 400 })
    }

    const users = getUsers()
    const userIndex = users.findIndex(u => u.email === email)
    
    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    // Update the user's password
    users[userIndex].password = hashedPassword
    saveUsers(users)

    return NextResponse.json({ 
      message: 'Password reset successfully',
      user: { 
        name: users[userIndex].name, 
        email: users[userIndex].email, 
        role: users[userIndex].role 
      }
    })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
