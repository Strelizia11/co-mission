"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Transaction {
  id: string;
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
}

export default function TransactionsPage() {
  const [user, setUser] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
                        {new Date(transaction.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${transactionType.color}`}>
                        {transactionType.type === 'sent' ? '-' : '+'}{transaction.amount} {transaction.currency}
                      </div>
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
                    {transaction.transactionHash && (
                      <div className="md:col-span-2">
                        <span className="font-medium text-gray-700">Transaction Hash:</span>
                        <span className="ml-2 text-gray-600 font-mono text-xs break-all">{transaction.transactionHash}</span>
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
  );
}
