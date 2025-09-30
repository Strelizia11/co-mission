import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const TRANSACTIONS_FILE = path.join(process.cwd(), 'transactions.json');

// Read transactions from file
function getTransactions(): any[] {
  if (!fs.existsSync(TRANSACTIONS_FILE)) return [];
  const data = fs.readFileSync(TRANSACTIONS_FILE, 'utf-8');
  return JSON.parse(data);
}

// Save transactions to file
function saveTransactions(transactions: any[]) {
  fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(transactions, null, 2));
}

// POST - Complete a transaction (mark as paid)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { transactionHash, blockNumber, gasUsed } = await request.json();
    const transactionId = params.id;

    console.log(`Completing transaction ${transactionId} with hash: ${transactionHash}`);

    // Read all transactions
    const allTransactions = getTransactions();
    
    // Find the transaction
    const transactionIndex = allTransactions.findIndex(t => t.id === transactionId);
    
    if (transactionIndex === -1) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Update transaction status
    allTransactions[transactionIndex] = {
      ...allTransactions[transactionIndex],
      status: 'completed',
      transactionHash: transactionHash || `tx_${Date.now()}`,
      blockNumber: blockNumber || Math.floor(Math.random() * 1000000),
      gasUsed: gasUsed || Math.floor(Math.random() * 50000),
      completedAt: new Date().toISOString()
    };

    // Save updated transactions
    saveTransactions(allTransactions);

    console.log(`Transaction ${transactionId} completed successfully`);

    return NextResponse.json({ 
      success: true, 
      transaction: allTransactions[transactionIndex] 
    });
  } catch (error) {
    console.error('Error completing transaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
