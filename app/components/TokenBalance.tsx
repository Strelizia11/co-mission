"use client";

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface TokenBalanceProps {
  className?: string;
  userEmail?: string;
}

interface TokenBalanceData {
  balance: string;
  formatted: string;
  symbol: string;
  taskRewards: string;
  reputationScore: string;
}

export default function TokenBalance({ className = "", userEmail }: TokenBalanceProps) {
  const { address, isConnected } = useAccount();
  const [balance, setBalance] = useState<TokenBalanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTokenBalance = async () => {
    // Use userEmail if provided, otherwise fall back to address
    const emailToUse = userEmail || address;
    if (!emailToUse) return;

    setLoading(true);
    setError(null);

    try {
      // Get CMT balance from the new API
      const response = await fetch(`/api/cmt/balance?email=${encodeURIComponent(emailToUse)}`);
      const data = await response.json();

      if (response.ok) {
        setBalance({
          balance: data.balance.toString(),
          formatted: `${data.balance} CMT`,
          symbol: 'CMT',
          taskRewards: data.taskRewards.toString(),
          reputationScore: data.reputationScore.toString()
        });
      } else {
        setError(data.error || 'Failed to fetch CMT balance');
      }
    } catch (err) {
      setError('Network error');
      console.error('Error fetching CMT balance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userEmail || (isConnected && address)) {
      fetchTokenBalance();
      // Refresh balance every 30 seconds
      const interval = setInterval(fetchTokenBalance, 30000);
      return () => clearInterval(interval);
    } else {
      setBalance(null);
      setError(null);
    }
  }, [userEmail, address, isConnected]);

  if (!userEmail && (!isConnected || !address)) {
    return (
      <div className={`bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg p-3 ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700">🪙 CMT Balance</h3>
        </div>
        <div className="text-center py-2">
          <p className="text-gray-600 text-xs">Connect wallet to view balance</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-[#FFBF00] to-[#FFD700] rounded-lg p-3 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-black">🪙 CMT Balance</h3>
        <button
          onClick={fetchTokenBalance}
          disabled={loading}
          className="text-black hover:text-gray-700 transition-colors"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-black"></div>
          ) : (
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
        </button>
      </div>

      {error ? (
        <div className="text-red-600 text-xs">
          <p>⚠️ {error}</p>
          <button
            onClick={fetchTokenBalance}
            className="text-blue-600 hover:text-blue-800 underline text-xs mt-1"
          >
            Try again
          </button>
        </div>
      ) : balance ? (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-black">
              {parseFloat(balance.balance).toFixed(2)}
            </span>
            <span className="text-sm font-semibold text-black">
              {balance.symbol}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div className="bg-black/10 rounded p-1.5">
              <p className="text-black/70 text-xs">Rewards</p>
              <p className="font-semibold text-black text-xs">
                {parseFloat(balance.taskRewards).toFixed(1)} CMT
              </p>
            </div>
            <div className="bg-black/10 rounded p-1.5">
              <p className="text-black/70 text-xs">Rating</p>
              <p className="font-semibold text-black text-xs">
                {balance.reputationScore} ⭐
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mx-auto"></div>
          <p className="text-black/70 text-xs mt-1">Loading...</p>
        </div>
      )}
    </div>
  );
}
