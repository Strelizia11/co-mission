import { NextRequest, NextResponse } from 'next/server';
import { TokenUtils } from '@/lib/token-utils';
import { ethers } from 'ethers';

const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS || '';
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8545';

export async function POST(request: NextRequest) {
  try {
    const { from, to, amount, privateKey } = await request.json();

    if (!from || !to || !amount || !privateKey) {
      return NextResponse.json({ 
        error: 'Missing required fields: from, to, amount, privateKey' 
      }, { status: 400 });
    }

    if (!TOKEN_ADDRESS) {
      return NextResponse.json({ 
        error: 'Token contract not deployed' 
      }, { status: 400 });
    }

    // Create provider and wallet
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(privateKey, provider);
    const tokenUtils = new TokenUtils(provider, wallet);

    // Execute transfer
    const tx = await tokenUtils.transfer(to, amount);
    await tx.wait();

    return NextResponse.json({
      success: true,
      transactionHash: tx.hash,
      from,
      to,
      amount,
      blockNumber: tx.blockNumber
    });

  } catch (error) {
    console.error('Error executing token transfer:', error);
    return NextResponse.json({ 
      error: 'Failed to execute transfer',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
