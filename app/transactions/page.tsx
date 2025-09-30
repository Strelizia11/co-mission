"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardHeader from '../components/DashboardHeader';
import SideNavigation from '../components/SideNavigation';

interface Transaction {
  id: string;
  transactionId: string;
  transactionAddress: string;
  taskId: string;
  senderEmail: string;
  recipientEmail: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  taskTitle: string;
  timestamp: string;
  transactionHash?: string;
  blockNumber?: number;
  gasUsed?: number;
  completedAt?: string;
  tokenType?: 'ETH' | 'CMT';
  tokenReward?: number;
  // Enhanced fields
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  nonce: number;
  payer: {
    email: string;
    type: string;
    role: string;
  };
  receiver: {
    email: string;
    type: string;
    role: string;
  };
  // Payment method fields
  paymentMethod?: string;
  ethAmount?: number;
  cmtAmount?: number;
  platformFee?: number;
  platformFeeCurrency?: string;
}

export default function TransactionsPage() {
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      fetchTransactions(userData.email);
    } else {
      router.push('/auth/login');
    }
  }, [router]);

  const fetchTransactions = async (userEmail: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/transactions?email=${encodeURIComponent(userEmail)}`);
      
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      } else {
        setError('Failed to fetch transactions');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError('Error loading transactions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTransactionType = (transaction: Transaction) => {
    if (transaction.senderEmail === user?.email) {
      return { type: 'sent', label: 'Payment Sent', color: 'text-red-600' };
    } else {
      return { type: 'received', label: 'Payment Received', color: 'text-green-600' };
    }
  };

  const formatTransactionAddress = (address: string) => {
    if (!address) return 'N/A';
    if (address.length <= 10) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFBF00] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Side Navigation */}
      <SideNavigation user={user} isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
      
      {/* Main Content Area */}
      <div className={`flex-1 ${isNavOpen ? '' : ''}`}>
        {/* Header */}
        <DashboardHeader user={user} onToggleNav={() => setIsNavOpen(true)} />
        
        {/* Page Header */}
        <div className="bg-[#191B1F] text-white p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Transaction History</h1>
            <p className="text-gray-300">View all your payment transactions</p>
          </div>
        </div>

      <div className="max-w-7xl mx-auto p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">💰</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Transactions Yet</h3>
            <p className="text-gray-500">Your transaction history will appear here once you start working on tasks.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => {
              const transactionType = getTransactionType(transaction);
              return (
                <div key={transaction.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{transaction.taskTitle}</h3>
                      <p className="text-gray-600">{transaction.description}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(transaction.timestamp)}
                      </p>
                      {/* Transaction Address */}
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">Transaction ID:</span>
                        <span className="text-xs font-mono text-gray-700 ml-1">
                          {formatTransactionAddress(transaction.transactionAddress || transaction.transactionId)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${transactionType.color}`}>
                        {transactionType.type === 'sent' ? '-' : '+'}{transaction.amount} {transaction.currency}
                      </div>
                      {transaction.tokenReward && (
                        <div className="text-lg font-semibold text-[#FFBF00] mb-1">
                          +{transaction.tokenReward} CMT
                        </div>
                      )}
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Transaction Type:</span>
                      <span className="ml-2 text-gray-600">{transactionType.label}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Task ID:</span>
                      <span className="ml-2 text-gray-600 font-mono">{transaction.taskId}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Payer:</span>
                      <span className="ml-2 text-gray-600">{transaction.payer?.email || transaction.senderEmail}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Receiver:</span>
                      <span className="ml-2 text-gray-600">{transaction.receiver?.email || transaction.recipientEmail}</span>
                    </div>
                    {transaction.transactionAddress && (
                      <div className="md:col-span-2">
                        <span className="font-medium text-gray-700">Transaction Address:</span>
                        <span className="ml-2 text-gray-600 font-mono text-xs break-all">{formatTransactionAddress(transaction.transactionAddress)}</span>
                      </div>
                    )}
                    {transaction.blockNumber && (
                      <div>
                        <span className="font-medium text-gray-700">Block Number:</span>
                        <span className="ml-2 text-gray-600">{transaction.blockNumber.toLocaleString()}</span>
                      </div>
                    )}
                    {transaction.gasUsed && (
                      <div>
                        <span className="font-medium text-gray-700">Gas Used:</span>
                        <span className="ml-2 text-gray-600">{transaction.gasUsed.toLocaleString()}</span>
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-gray-700">Date:</span>
                      <span className="ml-2 text-gray-600">{formatDate(transaction.timestamp)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Amount:</span>
                      <span className="ml-2 text-gray-600 font-semibold">{transaction.amount} {transaction.currency}</span>
                    </div>
                    {transaction.paymentMethod && (
                      <div>
                        <span className="font-medium text-gray-700">Payment Method:</span>
                        <span className="ml-2 text-gray-600">{transaction.paymentMethod}</span>
                      </div>
                    )}
                    {transaction.ethAmount && transaction.ethAmount > 0 && (
                      <div>
                        <span className="font-medium text-gray-700">ETH Amount:</span>
                        <span className="ml-2 text-gray-600">{transaction.ethAmount} ETH</span>
                      </div>
                    )}
                    {transaction.cmtAmount && transaction.cmtAmount > 0 && (
                      <div>
                        <span className="font-medium text-gray-700">CMT Amount:</span>
                        <span className="ml-2 text-gray-600">{transaction.cmtAmount} CMT</span>
                      </div>
                    )}
                    {transaction.platformFee && transaction.platformFee > 0 && (
                      <div>
                        <span className="font-medium text-gray-700">Platform Fee:</span>
                        <span className="ml-2 text-gray-600">{transaction.platformFee} {transaction.platformFeeCurrency}</span>
                      </div>
                    )}
                  </div>

                  {transaction.status === 'completed' && transaction.completedAt && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        Completed on: {new Date(transaction.completedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Summary Stats */}
        {transactions.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  +{transactions.filter(t => t.recipientEmail === user?.email).reduce((sum, t) => sum + t.amount, 0).toFixed(4)} ETH
                </div>
                <div className="text-sm text-gray-600">Total Received</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  -{transactions.filter(t => t.senderEmail === user?.email).reduce((sum, t) => sum + t.amount, 0).toFixed(4)} ETH
                </div>
                <div className="text-sm text-gray-600">Total Sent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {transactions.filter(t => t.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">Completed Transactions</div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
