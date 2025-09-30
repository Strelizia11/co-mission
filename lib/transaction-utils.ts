import { ethers } from 'ethers';

// Generate a crypto-style transaction hash/address
export function generateTransactionAddress(): string {
  // Generate a random 32-byte hash similar to Ethereum transaction hashes
  const randomBytes = ethers.utils.randomBytes(32);
  return ethers.utils.hexlify(randomBytes);
}

// Generate a shorter transaction ID for display
export function generateTransactionId(): string {
  const randomBytes = ethers.utils.randomBytes(16);
  return ethers.utils.hexlify(randomBytes).substring(2, 10).toUpperCase();
}

// Format transaction address for display (show first 6 and last 4 characters)
export function formatTransactionAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// Generate block number (simulate blockchain block)
export function generateBlockNumber(): number {
  // Generate a realistic block number (current block + random offset)
  const baseBlock = 18000000; // Approximate current Ethereum block
  const randomOffset = Math.floor(Math.random() * 1000);
  return baseBlock + randomOffset;
}

// Generate gas used (simulate transaction gas)
export function generateGasUsed(): number {
  // Typical gas usage for token transfers
  const baseGas = 21000;
  const tokenTransferGas = 65000;
  return baseGas + tokenTransferGas + Math.floor(Math.random() * 10000);
}

// Create comprehensive transaction record
export function createTransactionRecord(data: {
  taskId: string;
  senderEmail: string;
  recipientEmail: string;
  amount: number;
  currency: string;
  taskTitle: string;
  description?: string;
  tokenReward?: number;
  paymentMethod?: string;
  ethAmount?: number;
  cmtAmount?: number;
  platformFee?: number;
}): any {
  const transactionAddress = generateTransactionAddress();
  const transactionId = generateTransactionId();
  const blockNumber = generateBlockNumber();
  const gasUsed = generateGasUsed();
  const timestamp = new Date().toISOString();

  return {
    id: Date.now().toString(),
    transactionId,
    transactionAddress,
    taskId: data.taskId,
    senderEmail: data.senderEmail,
    recipientEmail: data.recipientEmail,
    amount: data.amount,
    currency: data.currency,
    status: 'pending',
    description: data.description || `Payment for task: ${data.taskTitle}`,
    taskTitle: data.taskTitle,
    timestamp,
    createdAt: timestamp,
    transactionHash: transactionAddress,
    blockNumber,
    gasUsed,
    tokenType: 'CMT',
    tokenReward: data.tokenReward || 0,
    // Additional crypto-style fields
    from: data.senderEmail,
    to: data.recipientEmail,
    value: data.amount.toString(),
    gasPrice: '20', // Gwei
    nonce: Math.floor(Math.random() * 1000000),
    // Payer/Receiver identification
    payer: {
      email: data.senderEmail,
      type: 'employer',
      role: 'Payer'
    },
    receiver: {
      email: data.recipientEmail,
      type: 'freelancer', 
      role: 'Receiver'
    },
    // Enhanced payment information
    paymentMethod: data.paymentMethod || 'ETH',
    ethAmount: data.ethAmount || (data.currency === 'ETH' ? data.amount : 0),
    cmtAmount: data.cmtAmount || (data.currency === 'CMT' ? data.amount : 0),
    platformFee: data.platformFee || 0,
    platformFeeCurrency: data.currency
  };
}

// Format transaction for display based on user role
export function formatTransactionForUser(transaction: any, userEmail: string): any {
  const isSender = transaction.senderEmail === userEmail;
  const isReceiver = transaction.recipientEmail === userEmail;
  
  return {
    ...transaction,
    userRole: isSender ? 'Payer' : 'Receiver',
    transactionType: isSender ? 'Payment Sent' : 'Payment Received',
    counterparty: isSender ? transaction.recipientEmail : transaction.senderEmail,
    amountDisplay: isSender ? `-${transaction.amount}` : `+${transaction.amount}`,
    statusColor: getStatusColor(transaction.status),
    formattedAddress: formatTransactionAddress(transaction.transactionAddress)
  };
}

// Get status color for UI
export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed': return 'text-green-600 bg-green-100';
    case 'pending': return 'text-yellow-600 bg-yellow-100';
    case 'failed': return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
}

// Get transaction type for display
export function getTransactionType(transaction: any, userEmail: string): {
  type: 'sent' | 'received';
  label: string;
  color: string;
} {
  if (transaction.senderEmail === userEmail) {
    return { 
      type: 'sent', 
      label: 'Payment Sent', 
      color: 'text-red-600' 
    };
  } else {
    return { 
      type: 'received', 
      label: 'Payment Received', 
      color: 'text-green-600' 
    };
  }
}
