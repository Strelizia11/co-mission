import { NextRequest, NextResponse } from 'next/server';
import { getUserBalanceInfo, updateCMTBalance, getCMTBalance, ensureEmployerInitialBalance } from '@/lib/cmt-balance-utils';
import { getUsers } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('email');

    if (!userEmail) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Get user info to check if they're an employer
    const users = getUsers();
    const user = users.find((u: any) => u.email === userEmail);
    
    // Ensure employer has initial CMT balance if they don't have one
    if (user && user.role === 'employer') {
      ensureEmployerInitialBalance(userEmail, user.role);
    }

    const balanceInfo = getUserBalanceInfo(userEmail);

    return NextResponse.json({
      success: true,
      balance: balanceInfo.cmtBalance,
      taskRewards: balanceInfo.taskRewards,
      reputationScore: balanceInfo.reputationScore,
      lastUpdated: balanceInfo.lastUpdated,
      userEmail: userEmail
    });

  } catch (error) {
    console.error('Error fetching CMT balance:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch CMT balance',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userEmail, amount, operation = 'add' } = await request.json();

    if (!userEmail || !amount) {
      return NextResponse.json({ 
        error: 'Missing required fields: userEmail, amount' 
      }, { status: 400 });
    }

    if (operation !== 'add' && operation !== 'subtract') {
      return NextResponse.json({ 
        error: 'Operation must be "add" or "subtract"' 
      }, { status: 400 });
    }

    const success = updateCMTBalance(userEmail, parseFloat(amount), operation);

    if (!success) {
      return NextResponse.json({ 
        error: 'Failed to update CMT balance' 
      }, { status: 500 });
    }

    const newBalance = getCMTBalance(userEmail);

    return NextResponse.json({
      success: true,
      message: `CMT balance ${operation === 'add' ? 'increased' : 'decreased'} by ${amount}`,
      newBalance: newBalance,
      operation: operation,
      amount: parseFloat(amount)
    });

  } catch (error) {
    console.error('Error updating CMT balance:', error);
    return NextResponse.json({ 
      error: 'Failed to update CMT balance',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
