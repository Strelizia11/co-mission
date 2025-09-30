import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const USERS_FILE = path.join(process.cwd(), 'users.json');
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

// Get all users
function getUsers(): any[] {
  if (!fs.existsSync(USERS_FILE)) return [];
  const data = fs.readFileSync(USERS_FILE, 'utf-8');
  return JSON.parse(data);
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Get user data
    const users = getUsers();
    const user = users.find((u: any) => u.email === email);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is an employer
    if (user.role !== 'employer') {
      return NextResponse.json({ error: 'Only employers can receive initial CMT balance' }, { status: 400 });
    }

    // Get current token balances
    const tokenBalances = getTokenBalances();

    // Check if user already has a balance
    if (tokenBalances[email]) {
      return NextResponse.json({ 
        message: 'User already has CMT balance',
        balance: tokenBalances[email].balance,
        alreadyInitialized: true
      });
    }

    // Initialize with 20 CMT
    const initialBalance = {
      balance: '20.0',
      taskRewards: '0.0',
      reputationScore: '5.0', // Default high reputation for employers
      initializedAt: new Date().toISOString(),
      userEmail: email,
      userRole: user.role
    };

    tokenBalances[email] = initialBalance;
    saveTokenBalances(tokenBalances);

    console.log(`Initialized 20 CMT for employer: ${email}`);

    return NextResponse.json({
      success: true,
      message: 'Initial CMT balance granted',
      balance: initialBalance.balance,
      userEmail: email,
      userRole: user.role
    });

  } catch (error) {
    console.error('Error initializing employer CMT balance:', error);
    return NextResponse.json({ 
      error: 'Failed to initialize CMT balance',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const tokenBalances = getTokenBalances();
    const userBalance = tokenBalances[email];

    if (!userBalance) {
      return NextResponse.json({ 
        balance: '0.0',
        taskRewards: '0.0',
        reputationScore: '0.0',
        initialized: false
      });
    }

    return NextResponse.json({
      balance: userBalance.balance,
      taskRewards: userBalance.taskRewards,
      reputationScore: userBalance.reputationScore,
      initialized: true,
      initializedAt: userBalance.initializedAt
    });

  } catch (error) {
    console.error('Error fetching CMT balance:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch CMT balance',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
