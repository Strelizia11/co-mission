import { NextResponse } from 'next/server';
import { updateTask, getTasks } from '@/lib/task-storage-persistent';
import { addFreelancerRating } from '@/lib/db';
import { createNotification } from '@/lib/notifications';
import { calculateTaskReward } from '@/lib/token-utils';
import { createTransactionRecord } from '@/lib/transaction-utils';
import { calculatePayment, EXCHANGE_RATES } from '@/lib/payment-utils';
import { processPayment, updateCMTBalance } from '@/lib/cmt-balance-utils';
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

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { rating, review, paymentMethod = 'ETH' } = await req.json();
    const taskId = params.id;

    // Get the task to find freelancer info
    const tasks = await getTasks();
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Update task status to completed (or rated later if rating provided)
    const updatedTask = await updateTask(taskId, {
      status: 'completed',
      completedAt: new Date().toISOString()
    });

    if (!updatedTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Add rating if provided
    if (rating && review && task.acceptedBy) {
      const newRating = {
        id: Date.now().toString(),
        taskId,
        employerEmail: task.employerEmail,
        employerName: task.employerName,
        rating: parseInt(rating),
        review,
        createdAt: new Date().toISOString()
      };

      addFreelancerRating(task.acceptedBy.email, newRating);
      await updateTask(taskId, { status: 'rated' });
    }

    // Create payment transaction
    if (task.acceptedBy && task.price) {
      // Calculate payment details based on method
      const freelancerRating = task.acceptedBy.rating || 3.0;
      const taskPrice = parseFloat(task.price);
      
      // Calculate payment based on method
      const paymentCalculation = calculatePayment(
        taskPrice,
        { type: paymentMethod, amount: taskPrice, currency: paymentMethod === 'CMT' ? 'CMT' : 'ETH' },
        freelancerRating
      );
      
      // Create enhanced transaction record with crypto-style address
      const transaction = createTransactionRecord({
        taskId,
        senderEmail: task.employerEmail,
        recipientEmail: task.acceptedBy.email,
        amount: paymentCalculation.freelancerAmount,
        currency: paymentCalculation.currency,
        taskTitle: task.title,
        description: `Payment for task: ${task.title}`,
        tokenReward: paymentCalculation.cmtReward,
        paymentMethod: paymentMethod,
        ethAmount: paymentCalculation.paymentBreakdown.eth || 0,
        cmtAmount: paymentCalculation.paymentBreakdown.cmt || 0,
        platformFee: paymentCalculation.platformFee
      });

      // Process payment and update CMT balances
      const paymentResult = processPayment({
        employerEmail: task.employerEmail,
        freelancerEmail: task.acceptedBy.email,
        amount: paymentCalculation.freelancerAmount,
        currency: paymentCalculation.currency,
        paymentMethod: paymentMethod,
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

      // Save transaction
      const allTransactions = getTransactions();
      allTransactions.push(transaction);
      saveTransactions(allTransactions);

      console.log('Payment transaction created:', transaction.id);
      console.log('Payment processed:', paymentResult.message);
    }

    // Notify freelancer about completion (and rating if provided)
    if (task.acceptedBy) {
      await createNotification({
        userEmail: task.acceptedBy.email,
        title: rating && review ? 'Task rated and payment initiated' : 'Task completed and payment initiated',
        message: rating && review
          ? `Employer rated your work on "${task.title}" with ${parseInt(rating)} star(s). Payment of ${task.price} ETH has been initiated.`
          : `Employer marked "${task.title}" as completed. Payment of ${task.price} ETH has been initiated.`,
        meta: { taskId }
      });
    }

    return NextResponse.json({ 
      message: 'Task completed successfully and payment initiated!',
      task: updatedTask,
      paymentInitiated: task.acceptedBy && task.price ? true : false
    });
  } catch (error) {
    console.error('Error completing task:', error);
    return NextResponse.json({ error: 'Failed to complete task' }, { status: 500 });
  }
}
