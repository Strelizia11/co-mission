import { NextRequest, NextResponse } from 'next/server';
import { TokenUtils } from '@/lib/token-utils';
import { ethers } from 'ethers';

// This would typically be loaded from environment variables or deployment info
const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS || '';
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8545';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    if (!TOKEN_ADDRESS) {
      return NextResponse.json({ 
        error: 'Token contract not deployed',
        balance: '0',
        formatted: '0.0000 CMT'
      }, { status: 200 });
    }

    // Create provider and token utils
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const tokenUtils = new TokenUtils(provider);

    // Get token balance
    const balanceInfo = await tokenUtils.getFormattedBalance(address);
    const taskRewards = await tokenUtils.getTotalTaskRewards(address);
    const reputationScore = await tokenUtils.getReputationScore(address);

    return NextResponse.json({
      balance: balanceInfo.balance,
      formatted: balanceInfo.formatted,
      symbol: balanceInfo.symbol,
      taskRewards: taskRewards,
      reputationScore: reputationScore.toString(),
      address: address
    });

  } catch (error) {
    console.error('Error fetching token balance:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch token balance',
      balance: '0',
      formatted: '0.0000 CMT'
    }, { status: 500 });
  }
}
