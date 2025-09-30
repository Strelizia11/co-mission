import { NextRequest, NextResponse } from 'next/server';
import { calculatePayment, checkEmployerBalance, getPaymentOptions } from '@/lib/payment-utils';
import * as fs from 'fs';
import * as path from 'path';

const TOKEN_BALANCES_FILE = path.join(process.cwd(), 'token-balances.json');

// Get token balances
function getTokenBalances(): Record<string, any> {
  if (!fs.existsSync(TOKEN_BALANCES_FILE)) return {};
  const data = fs.readFileSync(TOKEN_BALANCES_FILE, 'utf-8');
  return JSON.parse(data);
}

export async function POST(request: NextRequest) {
  try {
    const { 
      taskPrice, 
      paymentMethod, 
      employerEmail, 
      freelancerRating = 3.0 
    } = await request.json();

    if (!taskPrice || !paymentMethod || !employerEmail) {
      return NextResponse.json({ 
        error: 'Missing required fields: taskPrice, paymentMethod, employerEmail' 
      }, { status: 400 });
    }

    // Get employer's current balances
    const tokenBalances = getTokenBalances();
    const employerBalance = tokenBalances[employerEmail] || {
      balance: '0.0',
      ethBalance: '0.0',
      cmtBalance: '20.0' // Initial CMT balance for employers
    };

    // Calculate payment details
    const paymentCalculation = calculatePayment(
      parseFloat(taskPrice),
      paymentMethod,
      freelancerRating
    );

    // Check if employer has sufficient balance
    const balanceCheck = checkEmployerBalance(
      employerEmail,
      paymentCalculation.employerCost,
      paymentCalculation.currency,
      {
        eth: parseFloat(employerBalance.ethBalance || '0'),
        cmt: parseFloat(employerBalance.balance || '0')
      }
    );

    return NextResponse.json({
      success: true,
      paymentCalculation,
      balanceCheck,
      employerBalance: {
        eth: parseFloat(employerBalance.ethBalance || '0'),
        cmt: parseFloat(employerBalance.balance || '0')
      },
      paymentOptions: getPaymentOptions(parseFloat(taskPrice))
    });

  } catch (error) {
    console.error('Error calculating payment:', error);
    return NextResponse.json({ 
      error: 'Failed to calculate payment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskPrice = searchParams.get('taskPrice');
    const employerEmail = searchParams.get('employerEmail');

    if (!taskPrice || !employerEmail) {
      return NextResponse.json({ 
        error: 'Missing required fields: taskPrice, employerEmail' 
      }, { status: 400 });
    }

    // Get payment options for the task
    const paymentOptions = getPaymentOptions(parseFloat(taskPrice));

    // Get employer's current balances
    const tokenBalances = getTokenBalances();
    const employerBalance = tokenBalances[employerEmail] || {
      balance: '0.0',
      ethBalance: '0.0',
      cmtBalance: '20.0'
    };

    return NextResponse.json({
      success: true,
      paymentOptions,
      employerBalance: {
        eth: parseFloat(employerBalance.ethBalance || '0'),
        cmt: parseFloat(employerBalance.balance || '0')
      }
    });

  } catch (error) {
    console.error('Error getting payment options:', error);
    return NextResponse.json({ 
      error: 'Failed to get payment options',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
