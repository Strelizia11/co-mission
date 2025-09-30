// Exchange rates and payment utilities
export const EXCHANGE_RATES = {
  ETH_TO_CMT: 200, // 1 ETH = 200 CMT
  CMT_TO_ETH: 0.005, // 1 CMT = 0.005 ETH
  PLATFORM_FEE_RATE: 0.05, // 5% platform fee
  CMT_REWARD_RATE: 0.1 // 10% of payment as CMT rewards
};

export interface PaymentMethod {
  type: 'ETH' | 'CMT' | 'HYBRID';
  amount: number;
  currency: string;
  cmtAmount?: number;
  ethAmount?: number;
}

export interface PaymentCalculation {
  totalAmount: number;
  currency: string;
  platformFee: number;
  freelancerAmount: number;
  cmtReward: number;
  employerCost: number;
  paymentBreakdown: {
    eth?: number;
    cmt?: number;
  };
}

// Calculate payment details based on method
export function calculatePayment(
  taskPrice: number,
  paymentMethod: PaymentMethod,
  freelancerRating: number = 3.0
): PaymentCalculation {
  const platformFeeRate = EXCHANGE_RATES.PLATFORM_FEE_RATE;
  const cmtRewardRate = EXCHANGE_RATES.CMT_REWARD_RATE;
  
  let totalAmount = taskPrice;
  let currency = paymentMethod.currency;
  let platformFee = 0;
  let freelancerAmount = 0;
  let cmtReward = 0;
  let employerCost = 0;
  let paymentBreakdown: { eth?: number; cmt?: number } = {};

  switch (paymentMethod.type) {
    case 'ETH':
      platformFee = taskPrice * platformFeeRate;
      freelancerAmount = taskPrice - platformFee;
      cmtReward = freelancerAmount * cmtRewardRate * (1 + (freelancerRating - 3) * 0.1);
      employerCost = taskPrice;
      paymentBreakdown = { eth: taskPrice };
      break;

    case 'CMT':
      // Convert ETH price to CMT
      const cmtPrice = taskPrice * EXCHANGE_RATES.ETH_TO_CMT;
      platformFee = cmtPrice * platformFeeRate;
      freelancerAmount = cmtPrice - platformFee;
      cmtReward = freelancerAmount * cmtRewardRate * (1 + (freelancerRating - 3) * 0.1);
      employerCost = cmtPrice;
      totalAmount = cmtPrice;
      currency = 'CMT';
      paymentBreakdown = { cmt: cmtPrice };
      // For CMT payments, freelancer receives CMT directly
      freelancerAmount = cmtPrice; // Full CMT amount goes to freelancer
      break;

    case 'HYBRID':
      const ethAmount = paymentMethod.ethAmount || taskPrice * 0.6; // 60% ETH
      const cmtAmount = paymentMethod.cmtAmount || (taskPrice - ethAmount) * EXCHANGE_RATES.ETH_TO_CMT;
      
      const ethPlatformFee = ethAmount * platformFeeRate;
      const cmtPlatformFee = cmtAmount * platformFeeRate;
      
      platformFee = ethPlatformFee + (cmtPlatformFee / EXCHANGE_RATES.ETH_TO_CMT);
      freelancerAmount = (ethAmount - ethPlatformFee) + ((cmtAmount - cmtPlatformFee) / EXCHANGE_RATES.ETH_TO_CMT);
      cmtReward = freelancerAmount * cmtRewardRate * (1 + (freelancerRating - 3) * 0.1);
      employerCost = ethAmount + (cmtAmount / EXCHANGE_RATES.ETH_TO_CMT);
      
      paymentBreakdown = { eth: ethAmount, cmt: cmtAmount };
      break;
  }

  return {
    totalAmount,
    currency,
    platformFee,
    freelancerAmount,
    cmtReward,
    employerCost,
    paymentBreakdown
  };
}

// Check if employer has sufficient balance
export function checkEmployerBalance(
  employerEmail: string,
  requiredAmount: number,
  currency: string,
  currentBalances: { eth: number; cmt: number }
): { sufficient: boolean; shortfall?: number; currency?: string } {
  if (currency === 'ETH') {
    if (currentBalances.eth >= requiredAmount) {
      return { sufficient: true };
    }
    return { 
      sufficient: false, 
      shortfall: requiredAmount - currentBalances.eth,
      currency: 'ETH'
    };
  } else if (currency === 'CMT') {
    if (currentBalances.cmt >= requiredAmount) {
      return { sufficient: true };
    }
    return { 
      sufficient: false, 
      shortfall: requiredAmount - currentBalances.cmt,
      currency: 'CMT'
    };
  } else if (currency === 'HYBRID') {
    // For hybrid, we need to check both ETH and CMT balances
    const ethRequired = requiredAmount * 0.6;
    const cmtRequired = (requiredAmount - ethRequired) * EXCHANGE_RATES.ETH_TO_CMT;
    
    if (currentBalances.eth >= ethRequired && currentBalances.cmt >= cmtRequired) {
      return { sufficient: true };
    }
    
    const ethShortfall = Math.max(0, ethRequired - currentBalances.eth);
    const cmtShortfall = Math.max(0, cmtRequired - currentBalances.cmt);
    
    return { 
      sufficient: false, 
      shortfall: ethShortfall + (cmtShortfall / EXCHANGE_RATES.ETH_TO_CMT),
      currency: 'HYBRID'
    };
  }
  
  return { sufficient: false };
}

// Format payment method for display
export function formatPaymentMethod(paymentMethod: PaymentMethod): string {
  switch (paymentMethod.type) {
    case 'ETH':
      return `${paymentMethod.amount} ETH`;
    case 'CMT':
      return `${paymentMethod.amount} CMT`;
    case 'HYBRID':
      const ethPart = paymentMethod.ethAmount ? `${paymentMethod.ethAmount} ETH` : '';
      const cmtPart = paymentMethod.cmtAmount ? `${paymentMethod.cmtAmount} CMT` : '';
      return `${ethPart} + ${cmtPart}`;
    default:
      return 'Unknown';
  }
}

// Get payment method options for a given task price
export function getPaymentOptions(taskPrice: number): Array<{
  type: PaymentMethod['type'];
  label: string;
  description: string;
  amount: number;
  currency: string;
}> {
  return [
    {
      type: 'ETH',
      label: 'Pay with ETH',
      description: `Pay ${taskPrice} ETH`,
      amount: taskPrice,
      currency: 'ETH'
    },
    {
      type: 'CMT',
      label: 'Pay with CMT',
      description: `Pay ${taskPrice * EXCHANGE_RATES.ETH_TO_CMT} CMT`,
      amount: taskPrice * EXCHANGE_RATES.ETH_TO_CMT,
      currency: 'CMT'
    },
    {
      type: 'HYBRID',
      label: 'Pay with ETH + CMT',
      description: `Pay ${taskPrice * 0.6} ETH + ${taskPrice * 0.4 * EXCHANGE_RATES.ETH_TO_CMT} CMT`,
      amount: taskPrice,
      currency: 'HYBRID'
    }
  ];
}

// Convert between currencies
export function convertCurrency(amount: number, from: string, to: string): number {
  if (from === to) return amount;
  
  if (from === 'ETH' && to === 'CMT') {
    return amount * EXCHANGE_RATES.ETH_TO_CMT;
  }
  
  if (from === 'CMT' && to === 'ETH') {
    return amount * EXCHANGE_RATES.CMT_TO_ETH;
  }
  
  return amount;
}

// Get platform fee in the appropriate currency
export function getPlatformFee(amount: number, currency: string): number {
  return amount * EXCHANGE_RATES.PLATFORM_FEE_RATE;
}

// Calculate CMT rewards for freelancer
export function calculateCMTReward(
  paymentAmount: number,
  freelancerRating: number,
  currency: string
): number {
  const baseReward = paymentAmount * EXCHANGE_RATES.CMT_REWARD_RATE;
  const ratingBonus = (freelancerRating - 3) * 0.1; // 10% bonus per star above 3
  const totalReward = baseReward * (1 + ratingBonus);
  
  // Convert to CMT if payment was in ETH
  if (currency === 'ETH') {
    return totalReward * EXCHANGE_RATES.ETH_TO_CMT;
  }
  
  return totalReward;
}
