import { NextRequest, NextResponse } from 'next/server';
import { processPayment, getCMTBalance, getUserBalanceInfo } from '@/lib/cmt-balance-utils';
import { calculatePayment } from '@/lib/payment-utils';

export async function POST(request: NextRequest) {
  try {
    const { 
      taskId,
      employerEmail,
      freelancerEmail,
      taskPrice,
      paymentMethod,
      freelancerRating = 3.0
    } = await request.json();

    if (!taskId || !employerEmail || !freelancerEmail || !taskPrice || !paymentMethod) {
      return NextResponse.json({ 
        error: 'Missing required fields: taskId, employerEmail, freelancerEmail, taskPrice, paymentMethod' 
      }, { status: 400 });
    }

    // Calculate payment details
    const paymentCalculation = calculatePayment(
      parseFloat(taskPrice),
      { type: paymentMethod, amount: parseFloat(taskPrice), currency: paymentMethod === 'CMT' ? 'CMT' : 'ETH' },
      freelancerRating
    );

    // Check employer balance for CMT payments
    if (paymentMethod === 'CMT' || paymentMethod === 'HYBRID') {
      const employerBalance = getCMTBalance(employerEmail);
      const requiredCMT = paymentCalculation.paymentBreakdown.cmt || 0;
      
      if (employerBalance < requiredCMT) {
        return NextResponse.json({ 
          error: 'Insufficient CMT balance',
          required: requiredCMT,
          available: employerBalance
        }, { status: 400 });
      }
    }

    // Process the payment
    const paymentResult = processPayment({
      employerEmail,
      freelancerEmail,
      amount: paymentCalculation.freelancerAmount,
      currency: paymentCalculation.currency,
      paymentMethod,
      ethAmount: paymentCalculation.paymentBreakdown.eth,
      cmtAmount: paymentCalculation.paymentBreakdown.cmt,
      platformFee: paymentCalculation.platformFee,
      cmtReward: paymentCalculation.cmtReward
    });

    if (!paymentResult.success) {
      return NextResponse.json({ 
        error: paymentResult.message 
      }, { status: 400 });
    }

    // Get updated balances
    const employerBalance = getUserBalanceInfo(employerEmail);
    const freelancerBalance = getUserBalanceInfo(freelancerEmail);

    return NextResponse.json({
      success: true,
      message: paymentResult.message,
      paymentDetails: {
        taskId,
        employerEmail,
        freelancerEmail,
        paymentMethod,
        amount: paymentCalculation.freelancerAmount,
        currency: paymentCalculation.currency,
        cmtReward: paymentCalculation.cmtReward,
        platformFee: paymentCalculation.platformFee
      },
      updatedBalances: {
        employer: {
          cmtBalance: employerBalance.cmtBalance,
          taskRewards: employerBalance.taskRewards
        },
        freelancer: {
          cmtBalance: freelancerBalance.cmtBalance,
          taskRewards: freelancerBalance.taskRewards,
          reputationScore: freelancerBalance.reputationScore
        }
      }
    });

  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json({ 
      error: 'Payment processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
