import * as fs from 'fs';
import * as path from 'path';

const TOKEN_BALANCES_FILE = path.join(process.cwd(), 'token-balances.json');

// Initialize token balances file if it doesn't exist
function initializeTokenBalances() {
  if (!fs.existsSync(TOKEN_BALANCES_FILE)) {
    fs.writeFileSync(TOKEN_BALANCES_FILE, JSON.stringify({}, null, 2));
  }
}

// Get all token balances
export function getTokenBalances(): Record<string, any> {
  initializeTokenBalances();
  const data = fs.readFileSync(TOKEN_BALANCES_FILE, 'utf-8');
  return JSON.parse(data);
}

// Save token balances
export function saveTokenBalances(balances: Record<string, any>) {
  fs.writeFileSync(TOKEN_BALANCES_FILE, JSON.stringify(balances, null, 2));
}

// Get user's CMT balance
export function getCMTBalance(userEmail: string): number {
  const balances = getTokenBalances();
  const userBalance = balances[userEmail];
  
  // If user doesn't have a balance record, return 0
  if (!userBalance) {
    return 0;
  }
  
  return parseFloat(userBalance.balance || '0');
}

// Update user's CMT balance
export function updateCMTBalance(userEmail: string, amount: number, operation: 'add' | 'subtract' = 'add'): boolean {
  try {
    const balances = getTokenBalances();
    const currentBalance = getCMTBalance(userEmail);
    
    let newBalance: number;
    if (operation === 'add') {
      newBalance = currentBalance + amount;
    } else {
      newBalance = Math.max(0, currentBalance - amount); // Prevent negative balance
    }

    // Initialize user balance if doesn't exist
    if (!balances[userEmail]) {
      balances[userEmail] = {
        balance: '0.0',
        taskRewards: '0.0',
        reputationScore: '3.0',
        initializedAt: new Date().toISOString(),
        userEmail: userEmail,
        userRole: 'freelancer'
      };
    }

    // Update balance
    balances[userEmail].balance = newBalance.toFixed(2);
    balances[userEmail].lastUpdated = new Date().toISOString();

    // Add to task rewards if it's a payment
    if (operation === 'add') {
      const currentRewards = parseFloat(balances[userEmail].taskRewards || '0');
      balances[userEmail].taskRewards = (currentRewards + amount).toFixed(2);
    }

    saveTokenBalances(balances);
    console.log(`Updated CMT balance for ${userEmail}: ${newBalance.toFixed(2)} CMT`);
    return true;
  } catch (error) {
    console.error('Error updating CMT balance:', error);
    return false;
  }
}

// Process payment and update balances
export function processPayment(paymentData: {
  employerEmail: string;
  freelancerEmail: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  ethAmount?: number;
  cmtAmount?: number;
  platformFee?: number;
  cmtReward?: number;
}): { success: boolean; message: string } {
  try {
    const { employerEmail, freelancerEmail, amount, currency, paymentMethod, ethAmount, cmtAmount, platformFee, cmtReward } = paymentData;

    // Update employer balance (subtract payment)
    if (paymentMethod === 'ETH') {
      // For ETH payments, we don't update CMT balance for employer
      console.log(`Employer ${employerEmail} paid ${amount} ETH`);
    } else if (paymentMethod === 'CMT') {
      // For CMT payments, subtract from employer's CMT balance
      const employerBalance = getCMTBalance(employerEmail);
      if (employerBalance < amount) {
        return { success: false, message: 'Insufficient CMT balance' };
      }
      updateCMTBalance(employerEmail, amount, 'subtract');
    } else if (paymentMethod === 'HYBRID') {
      // For hybrid payments, subtract CMT portion from employer
      if (cmtAmount && cmtAmount > 0) {
        const employerBalance = getCMTBalance(employerEmail);
        if (employerBalance < cmtAmount) {
          return { success: false, message: 'Insufficient CMT balance for hybrid payment' };
        }
        updateCMTBalance(employerEmail, cmtAmount, 'subtract');
      }
    }

    // Update freelancer balance (add payment + rewards)
    let totalFreelancerCMT = 0;
    
    if (currency === 'CMT') {
      // Direct CMT payment - full amount goes to freelancer
      totalFreelancerCMT = amount;
      console.log(`Direct CMT payment: ${amount} CMT to freelancer`);
    } else if (currency === 'ETH' && cmtAmount) {
      // ETH payment converted to CMT
      totalFreelancerCMT = cmtAmount;
      console.log(`ETH payment converted to CMT: ${cmtAmount} CMT to freelancer`);
    } else if (paymentMethod === 'HYBRID' && cmtAmount) {
      // Hybrid payment CMT portion
      totalFreelancerCMT = cmtAmount;
      console.log(`Hybrid payment CMT portion: ${cmtAmount} CMT to freelancer`);
    }

    // Add CMT rewards (bonus tokens for good work)
    if (cmtReward && cmtReward > 0) {
      totalFreelancerCMT += cmtReward;
      console.log(`CMT rewards added: ${cmtReward} CMT`);
    }

    // Update freelancer's CMT balance with total amount
    if (totalFreelancerCMT > 0) {
      updateCMTBalance(freelancerEmail, totalFreelancerCMT, 'add');
      console.log(`Total CMT added to freelancer: ${totalFreelancerCMT} CMT`);
    }

    return { 
      success: true, 
      message: `Payment processed: ${totalFreelancerCMT.toFixed(2)} CMT added to freelancer balance` 
    };

  } catch (error) {
    console.error('Error processing payment:', error);
    return { success: false, message: 'Payment processing failed' };
  }
}

// Get user's complete balance info
export function getUserBalanceInfo(userEmail: string): {
  cmtBalance: number;
  taskRewards: number;
  reputationScore: number;
  lastUpdated?: string;
} {
  const balances = getTokenBalances();
  const userBalance = balances[userEmail];
  
  if (!userBalance) {
    return {
      cmtBalance: 0,
      taskRewards: 0,
      reputationScore: 3.0
    };
  }

  return {
    cmtBalance: parseFloat(userBalance.balance || '0'),
    taskRewards: parseFloat(userBalance.taskRewards || '0'),
    reputationScore: parseFloat(userBalance.reputationScore || '3.0'),
    lastUpdated: userBalance.lastUpdated
  };
}

// Ensure employer has initial CMT balance
export function ensureEmployerInitialBalance(userEmail: string, userRole: string): boolean {
  try {
    // Only initialize for employers
    if (userRole !== 'employer') {
      return false;
    }

    const balances = getTokenBalances();
    const existingBalance = balances[userEmail];

    // If employer already has a balance, don't override
    if (existingBalance && parseFloat(existingBalance.balance || '0') > 0) {
      return true;
    }

    // Initialize with 20 CMT for new employers
    balances[userEmail] = {
      balance: '20.0',
      taskRewards: '0.0',
      reputationScore: '5.0', // Default high reputation for employers
      initializedAt: new Date().toISOString(),
      userEmail: userEmail,
      userRole: 'employer',
      lastUpdated: new Date().toISOString()
    };

    saveTokenBalances(balances);
    console.log(`Ensured 20 CMT initial balance for employer: ${userEmail}`);
    return true;

  } catch (error) {
    console.error('Error ensuring employer initial balance:', error);
    return false;
  }
}

// Transfer CMT between users
export function transferCMT(fromEmail: string, toEmail: string, amount: number): { success: boolean; message: string } {
  try {
    const fromBalance = getCMTBalance(fromEmail);
    
    if (fromBalance < amount) {
      return { success: false, message: 'Insufficient CMT balance' };
    }

    // Subtract from sender
    updateCMTBalance(fromEmail, amount, 'subtract');
    
    // Add to receiver
    updateCMTBalance(toEmail, amount, 'add');

    return { 
      success: true, 
      message: `Transferred ${amount} CMT from ${fromEmail} to ${toEmail}` 
    };

  } catch (error) {
    console.error('Error transferring CMT:', error);
    return { success: false, message: 'Transfer failed' };
  }
}

// Get balance history (optional feature)
export function getBalanceHistory(userEmail: string): Array<{
  date: string;
  amount: number;
  operation: string;
  description: string;
}> {
  // This could be enhanced to track balance changes over time
  // For now, return current balance info
  const balanceInfo = getUserBalanceInfo(userEmail);
  return [{
    date: new Date().toISOString(),
    amount: balanceInfo.cmtBalance,
    operation: 'current',
    description: 'Current CMT balance'
  }];
}
