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

// GET - Retrieve transactions for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('email');

    if (!userEmail) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    console.log(`Fetching transactions for user: ${userEmail}`);

    // Get all transactions
    const allTransactions = getTransactions();
    
    // Filter transactions for the specific user (as sender or recipient)
    const userTransactions = allTransactions.filter(transaction => 
      transaction.senderEmail === userEmail || transaction.recipientEmail === userEmail
    );

    // Sort by date (newest first)
    userTransactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    console.log(`Found ${userTransactions.length} transactions for ${userEmail}`);

    return NextResponse.json({ 
      transactions: userTransactions 
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new transaction
export async function POST(request: NextRequest) {
  try {
    const transactionData = await request.json();
    const { 
      taskId, 
      senderEmail, 
      recipientEmail, 
      amount, 
      currency, 
      status, 
      description,
      taskTitle 
    } = transactionData;

    if (!taskId || !senderEmail || !recipientEmail || !amount || !currency) {
      return NextResponse.json({ 
        error: 'Missing required fields: taskId, senderEmail, recipientEmail, amount, currency' 
      }, { status: 400 });
    }

    console.log('Creating new transaction:', transactionData);

    // Create transaction object
    const transaction = {
      id: Date.now().toString(),
      taskId,
      senderEmail,
      recipientEmail,
      amount: parseFloat(amount),
      currency,
      status: status || 'pending',
      description: description || 'Task completion payment',
      taskTitle: taskTitle || 'Task Payment',
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      transactionHash: null, // Will be set when blockchain transaction is confirmed
      blockNumber: null,
      gasUsed: null
    };

    // Save transaction
    const allTransactions = getTransactions();
    allTransactions.push(transaction);
    saveTransactions(allTransactions);

    console.log('Transaction created successfully:', transaction.id);

    return NextResponse.json({ 
      success: true, 
      transaction: transaction 
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}
