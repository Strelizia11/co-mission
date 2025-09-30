import { NextRequest, NextResponse } from 'next/server';
import { getUsers } from '@/lib/db';
import { getTokenBalances, saveTokenBalances, getUserBalanceInfo } from '@/lib/cmt-balance-utils';

export async function POST(request: NextRequest) {
  try {
    const { forceUpdate = false } = await request.json();

    // Get all users
    const users = getUsers();
    const employers = users.filter((user: any) => user.role === 'employer');
    
    if (employers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No employers found',
        initialized: 0
      });
    }

    // Get current token balances
    const tokenBalances = getTokenBalances();
    let initializedCount = 0;
    let alreadyInitializedCount = 0;

    for (const employer of employers) {
      const existingBalance = tokenBalances[employer.email];
      
      // Check if employer already has CMT balance
      if (existingBalance && !forceUpdate) {
        alreadyInitializedCount++;
        continue;
      }

      // Initialize or update CMT balance
      tokenBalances[employer.email] = {
        balance: '20.0',
        taskRewards: '0.0',
        reputationScore: '5.0', // Default high reputation for employers
        initializedAt: new Date().toISOString(),
        userEmail: employer.email,
        userRole: 'employer',
        lastUpdated: new Date().toISOString()
      };

      initializedCount++;
      console.log(`Initialized 20 CMT for employer: ${employer.email}`);
    }

    // Save updated balances
    saveTokenBalances(tokenBalances);

    return NextResponse.json({
      success: true,
      message: `CMT balance initialization completed`,
      totalEmployers: employers.length,
      initialized: initializedCount,
      alreadyInitialized: alreadyInitializedCount,
      employers: employers.map((emp: any) => ({
        email: emp.email,
        name: emp.name,
        hasCMTBalance: !!tokenBalances[emp.email],
        cmtBalance: tokenBalances[emp.email]?.balance || '0.0'
      }))
    });

  } catch (error) {
    console.error('Error initializing employer CMT balances:', error);
    return NextResponse.json({ 
      error: 'Failed to initialize CMT balances',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get all users
    const users = getUsers();
    const employers = users.filter((user: any) => user.role === 'employer');
    
    // Get current token balances
    const tokenBalances = getTokenBalances();
    
    const employerBalances = employers.map((employer: any) => {
      const balanceInfo = getUserBalanceInfo(employer.email);
      return {
        email: employer.email,
        name: employer.name,
        role: employer.role,
        cmtBalance: balanceInfo.cmtBalance,
        taskRewards: balanceInfo.taskRewards,
        reputationScore: balanceInfo.reputationScore,
        hasInitialBalance: balanceInfo.cmtBalance >= 20,
        lastUpdated: balanceInfo.lastUpdated
      };
    });

    return NextResponse.json({
      success: true,
      totalEmployers: employers.length,
      employers: employerBalances
    });

  } catch (error) {
    console.error('Error fetching employer CMT balances:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch employer balances',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
