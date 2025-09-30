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
        
        {/* Distinct Page Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-br from-[#FFBF00] to-[#FF6B00] p-3 rounded-xl shadow-sm">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
                  <p className="text-gray-600 mt-1">View all your payment transactions and transfer history</p>
                </div>
              </div>
              
              {transactions.length > 0 && (
                <div className="mt-6 md:mt-0 flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {transactions.filter(t => t.recipientEmail === user?.email).length}
                    </div>
                    <div className="text-sm font-medium text-gray-600">Received</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {transactions.filter(t => t.senderEmail === user?.email).length}
                    </div>
                    <div className="text-sm font-medium text-gray-600">Sent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {transactions.filter(t => t.status === 'completed').length}
                    </div>
                    <div className="text-sm font-medium text-gray-600">Completed</div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Quick Stats Bar */}
            {transactions.length > 0 && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-700">
                    +{transactions.filter(t => t.recipientEmail === user?.email).reduce((sum, t) => sum + t.amount, 0).toFixed(4)} ETH
                  </div>
                  <div className="text-sm font-medium text-green-600">Total Received</div>
                </div>
                <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-700">
                    {transactions.filter(t => t.senderEmail === user?.email).reduce((sum, t) => sum + t.amount, 0).toFixed(4)} ETH
                  </div>
                  <div className="text-sm font-medium text-red-600">Total Sent</div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-700">
                    {transactions.filter(t => t.status === 'completed').length}
                  </div>
                  <div className="text-sm font-medium text-blue-600">Completed</div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-700">
                    {transactions.length}
                  </div>
                  <div className="text-sm font-medium text-purple-600">Total Transactions</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {transactions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-3">No Transactions Yet</h3>
              <p className="text-gray-500 text-lg max-w-md mx-auto">
                Your transaction history will appear here once you start making or receiving payments.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
                <span className="text-sm text-gray-500">
                  Showing {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              {transactions.map((transaction) => {
                const transactionType = getTransactionType(transaction);
                return (
                  <div key={transaction.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
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
        </div>
      </div>
    </div>
  );
}