import { NextResponse } from 'next/server'
import * as bcrypt from 'bcryptjs'
import { getUsers, saveUsers } from '@/lib/db'
import * as fs from 'fs'
import * as path from 'path'

const TOKEN_BALANCES_FILE = path.join(process.cwd(), 'token-balances.json');

// Initialize token balances file if it doesn't exist
function initializeTokenBalances() {
  if (!fs.existsSync(TOKEN_BALANCES_FILE)) {
    fs.writeFileSync(TOKEN_BALANCES_FILE, JSON.stringify({}, null, 2));
  }
}

// Get token balances
function getTokenBalances(): Record<string, any> {
  initializeTokenBalances();
  const data = fs.readFileSync(TOKEN_BALANCES_FILE, 'utf-8');
  return JSON.parse(data);
}

// Save token balances
function saveTokenBalances(balances: Record<string, any>) {
  fs.writeFileSync(TOKEN_BALANCES_FILE, JSON.stringify(balances, null, 2));
}

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

    // Initialize CMT balance for employers
    if (newUser.role === 'employer') {
      const tokenBalances = getTokenBalances();
      tokenBalances[email] = {
        balance: '20.0',
        taskRewards: '0.0',
        reputationScore: '5.0', // Default high reputation for employers
        initializedAt: new Date().toISOString(),
        userEmail: email,
        userRole: newUser.role
      };
      saveTokenBalances(tokenBalances);
      console.log(`Initialized 20 CMT for new employer: ${email}`);
    }

    return NextResponse.json({ 
      message: 'User registered successfully!',
      user: { name, email, role: newUser.role },
      cmtInitialized: newUser.role === 'employer' ? '20 CMT' : null
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
