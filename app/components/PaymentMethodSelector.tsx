"use client";

import { useState, useEffect } from 'react';

interface PaymentMethodSelectorProps {
  taskPrice: number;
  employerEmail: string;
  onPaymentMethodSelect: (method: any) => void;
  className?: string;
}

interface PaymentOption {
  type: 'ETH' | 'CMT' | 'HYBRID';
  label: string;
  description: string;
  amount: number;
  currency: string;
}

interface EmployerBalance {
  eth: number;
  cmt: number;
}

export default function PaymentMethodSelector({ 
  taskPrice, 
  employerEmail, 
  onPaymentMethodSelect,
  className = "" 
}: PaymentMethodSelectorProps) {
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
  const [employerBalance, setEmployerBalance] = useState<EmployerBalance>({ eth: 0, cmt: 20 });
  const [selectedMethod, setSelectedMethod] = useState<string>('ETH');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentOptions();
  }, [taskPrice, employerEmail]);

  const fetchPaymentOptions = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/payment/calculate?taskPrice=${taskPrice}&employerEmail=${encodeURIComponent(employerEmail)}`);
      const data = await response.json();

      if (response.ok) {
        setPaymentOptions(data.paymentOptions);
        setEmployerBalance(data.employerBalance);
      } else {
        setError(data.error || 'Failed to load payment options');
      }
    } catch (err) {
      setError('Network error');
      console.error('Error fetching payment options:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMethodSelect = (method: PaymentOption) => {
    setSelectedMethod(method.type);
    onPaymentMethodSelect(method);
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'ETH': return 'Ξ';
      case 'CMT': return '🪙';
      case 'HYBRID': return '⚡';
      default: return '💰';
    }
  };

  const getMethodColor = (type: string) => {
    switch (type) {
      case 'ETH': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CMT': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'HYBRID': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isMethodAvailable = (method: PaymentOption) => {
    if (method.type === 'ETH') {
      return employerBalance.eth >= method.amount;
    } else if (method.type === 'CMT') {
      return employerBalance.cmt >= method.amount;
    } else if (method.type === 'HYBRID') {
      const ethRequired = method.amount * 0.6;
      const cmtRequired = method.amount * 0.4 * 200; // Assuming 1 ETH = 200 CMT
      return employerBalance.eth >= ethRequired && employerBalance.cmt >= cmtRequired;
    }
    return true;
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center">
          <span className="text-red-500 mr-2">⚠️</span>
          <p className="text-red-700">{error}</p>
        </div>
        <button
          onClick={fetchPaymentOptions}
          className="mt-2 text-red-600 hover:text-red-800 underline text-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Payment Method</h3>
      
      {/* Balance Display */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Your Balances</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{employerBalance.eth.toFixed(4)}</div>
            <div className="text-sm text-gray-600">ETH</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{employerBalance.cmt.toFixed(0)}</div>
            <div className="text-sm text-gray-600">CMT</div>
          </div>
        </div>
      </div>

      {/* Payment Options */}
      <div className="space-y-3">
        {paymentOptions.map((option) => {
          const isAvailable = isMethodAvailable(option);
          const isSelected = selectedMethod === option.type;
          
          return (
            <button
              key={option.type}
              onClick={() => handleMethodSelect(option)}
              disabled={!isAvailable}
              className={`w-full p-4 rounded-lg border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : isAvailable
                  ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{getMethodIcon(option.type)}</span>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-600">{option.description}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getMethodColor(option.type)}`}>
                    {option.type}
                  </div>
                  {!isAvailable && (
                    <div className="text-xs text-red-600 mt-1">Insufficient balance</div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Exchange Rate Info */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="text-sm text-blue-800">
          <strong>Exchange Rate:</strong> 1 ETH = 200 CMT
        </div>
        <div className="text-xs text-blue-600 mt-1">
          Platform fee: 5% | CMT rewards: 10% of payment
        </div>
      </div>
    </div>
  );
}
