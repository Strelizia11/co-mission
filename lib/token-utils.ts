import { ethers } from 'ethers';

// Token contract ABI (simplified for frontend)
export const TOKEN_ABI = [
  // ERC-20 standard functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  
  // CoMission Token specific functions
  "function distributeTaskReward(address freelancer, uint256 amount, string memory taskId)",
  "function updateReputation(address user, uint256 score)",
  "function getTotalTaskRewards(address user) view returns (uint256)",
  "function getReputationScore(address user) view returns (uint256)",
  "function platformTreasury() view returns (address)",
  "function rewardPool() view returns (address)",
  
  // Events
  "event TaskRewardDistributed(address indexed freelancer, uint256 amount, string taskId)",
  "event ReputationUpdated(address indexed user, uint256 newScore)",
  "event PlatformFeeCollected(uint256 amount)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

// Token configuration
export const TOKEN_CONFIG = {
  name: "CoMission Token",
  symbol: "CMT",
  decimals: 18,
  // These will be updated after deployment
  address: process.env.NEXT_PUBLIC_TOKEN_ADDRESS || "",
  network: process.env.NEXT_PUBLIC_NETWORK || "localhost"
};

// Token utility functions
export class TokenUtils {
  private contract: ethers.Contract | null = null;
  private provider: ethers.providers.Provider | null = null;
  private signer: ethers.Signer | null = null;

  constructor(provider: ethers.providers.Provider, signer?: ethers.Signer) {
    this.provider = provider;
    this.signer = signer || null;
    
    if (TOKEN_CONFIG.address) {
      this.contract = new ethers.Contract(
        TOKEN_CONFIG.address,
        TOKEN_ABI,
        signer || provider
      );
    }
  }

  // Get token balance for an address
  async getBalance(address: string): Promise<string> {
    if (!this.contract) throw new Error("Token contract not initialized");
    
    const balance = await this.contract.balanceOf(address);
    return ethers.utils.formatEther(balance);
  }

  // Get token info
  async getTokenInfo() {
    if (!this.contract) throw new Error("Token contract not initialized");
    
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      this.contract.name(),
      this.contract.symbol(),
      this.contract.decimals(),
      this.contract.totalSupply()
    ]);

    return {
      name,
      symbol,
      decimals,
      totalSupply: ethers.utils.formatEther(totalSupply)
    };
  }

  // Transfer tokens
  async transfer(to: string, amount: string): Promise<ethers.providers.TransactionResponse> {
    if (!this.contract || !this.signer) {
      throw new Error("Contract or signer not available");
    }

    const amountWei = ethers.utils.parseEther(amount);
    return await this.contract.transfer(to, amountWei);
  }

  // Approve tokens
  async approve(spender: string, amount: string): Promise<ethers.providers.TransactionResponse> {
    if (!this.contract || !this.signer) {
      throw new Error("Contract or signer not available");
    }

    const amountWei = ethers.utils.parseEther(amount);
    return await this.contract.approve(spender, amountWei);
  }

  // Get user's task rewards
  async getTotalTaskRewards(address: string): Promise<string> {
    if (!this.contract) throw new Error("Token contract not initialized");
    
    const rewards = await this.contract.getTotalTaskRewards(address);
    return ethers.utils.formatEther(rewards);
  }

  // Get user's reputation score
  async getReputationScore(address: string): Promise<number> {
    if (!this.contract) throw new Error("Token contract not initialized");
    
    return await this.contract.getReputationScore(address);
  }

  // Format token amount for display
  static formatTokenAmount(amount: string, decimals: number = 18): string {
    return ethers.utils.formatUnits(amount, decimals);
  }

  // Parse token amount for transactions
  static parseTokenAmount(amount: string, decimals: number = 18): string {
    return ethers.utils.parseUnits(amount, decimals).toString();
  }

  // Get token balance with proper formatting
  async getFormattedBalance(address: string): Promise<{
    balance: string;
    formatted: string;
    symbol: string;
  }> {
    const balance = await this.getBalance(address);
    const info = await this.getTokenInfo();
    
    return {
      balance,
      formatted: `${parseFloat(balance).toFixed(4)} ${info.symbol}`,
      symbol: info.symbol
    };
  }
}

// Token deployment info (will be updated after deployment)
export interface TokenDeploymentInfo {
  network: string;
  tokenAddress: string;
  platformTreasury: string;
  rewardPool: string;
  deployer: string;
  timestamp: string;
}

// Load deployment info
export async function loadDeploymentInfo(): Promise<TokenDeploymentInfo | null> {
  try {
    const response = await fetch('/api/token/deployment-info');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to load deployment info:', error);
  }
  return null;
}

// Token reward calculation
export function calculateTaskReward(
  taskPrice: number,
  freelancerRating: number,
  platformFee: number = 0.05 // 5% platform fee
): {
  freelancerReward: number;
  platformFee: number;
  total: number;
} {
  const total = taskPrice;
  const platformFeeAmount = total * platformFee;
  const freelancerReward = total - platformFeeAmount;
  
  // Bonus for high-rated freelancers
  const ratingBonus = freelancerRating >= 4.5 ? 0.1 : 0; // 10% bonus for 4.5+ rating
  const bonusAmount = freelancerReward * ratingBonus;
  
  return {
    freelancerReward: freelancerReward + bonusAmount,
    platformFee: platformFeeAmount,
    total: total + bonusAmount
  };
}
