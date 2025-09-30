# 🪙 CoMission Token (CMT) System

## Overview

The CoMission Token (CMT) is a custom ERC-20 token designed specifically for the Co-Mission platform. It serves as the primary utility token for task payments, rewards, and platform governance.

## 🚀 Features

### **Token Specifications**
- **Name**: CoMission Token
- **Symbol**: CMT
- **Decimals**: 18
- **Initial Supply**: 1,000,000 CMT
- **Max Supply**: 10,000,000 CMT
- **Standard**: ERC-20 with additional utility functions

### **Core Functions**
1. **Task Payments**: Freelancers receive CMT tokens for completed tasks
2. **Reputation System**: Higher-rated freelancers earn bonus tokens
3. **Platform Governance**: Token holders can vote on platform decisions
4. **Staking Rewards**: Lock tokens to earn additional rewards
5. **Fee Collection**: Platform collects small fees in CMT

## 🏗️ Smart Contract Architecture

### **Contract: CoMissionToken.sol**
```solidity
// Key Functions:
- distributeTaskReward() // Reward freelancers
- updateReputation() // Update user reputation
- getTotalTaskRewards() // View earnings
- getReputationScore() // Check reputation
- collectPlatformFee() // Platform revenue
```

### **Token Economics**
- **Task Rewards**: 60% of total supply for task completion
- **Platform Development**: 20% for platform growth
- **Staking Rewards**: 10% for token stakers
- **Community Incentives**: 10% for community programs

## 💰 Reward Calculation

### **Base Formula**
```javascript
const calculateTaskReward = (taskPrice, freelancerRating, platformFee = 0.05) => {
  const total = taskPrice;
  const platformFeeAmount = total * platformFee;
  const freelancerReward = total - platformFeeAmount;
  
  // Bonus for high-rated freelancers (4.5+ rating)
  const ratingBonus = freelancerRating >= 4.5 ? 0.1 : 0;
  const bonusAmount = freelancerReward * ratingBonus;
  
  return {
    freelancerReward: freelancerReward + bonusAmount,
    platformFee: platformFeeAmount,
    total: total + bonusAmount
  };
};
```

### **Reward Tiers**
- **⭐ 4.5+ Rating**: 10% bonus tokens
- **⭐ 4.0-4.4 Rating**: 5% bonus tokens
- **⭐ 3.0-3.9 Rating**: Standard rewards
- **⭐ Below 3.0**: Standard rewards (no penalty)

## 🔧 Integration Points

### **Frontend Components**
1. **TokenBalance.tsx**: Display user's CMT balance
2. **DashboardHeader.tsx**: Integrated token balance
3. **TransactionsPage.tsx**: Show CMT rewards in transaction history

### **API Endpoints**
- `/api/token/balance` - Get user's token balance
- `/api/token/transfer` - Execute token transfers
- `/api/token/deployment-info` - Get contract deployment info

### **Smart Contract Integration**
- **TokenUtils.ts**: Frontend utility library
- **Deployment Scripts**: Automated contract deployment
- **Hardhat Configuration**: Development environment setup

## 🚀 Deployment Process

### **1. Install Dependencies**
```bash
cd contracts
npm install
```

### **2. Compile Contracts**
```bash
npm run compile
```

### **3. Deploy to Local Network**
```bash
# Start local blockchain
npm run node

# Deploy token (in another terminal)
npm run deploy
```

### **4. Deploy to Testnet**
```bash
npm run deploy:sepolia
```

## 📊 Token Utility

### **For Freelancers**
- Earn CMT tokens for completed tasks
- Receive bonus tokens for high ratings
- Use tokens for platform features
- Stake tokens for additional rewards

### **For Employers**
- Pay freelancers in CMT tokens
- Reduce transaction costs
- Participate in platform governance
- Access premium features

### **For Platform**
- Collect fees in CMT tokens
- Fund development and growth
- Reward community contributors
- Maintain token economy

## 🔒 Security Features

### **Access Control**
- Only contract owner can mint new tokens
- Only owner can distribute task rewards
- Reputation updates require owner approval

### **Economic Safeguards**
- Maximum supply cap prevents inflation
- Platform fee collection ensures sustainability
- Reputation-based rewards encourage quality work

## 📈 Future Enhancements

### **Planned Features**
1. **Token Staking**: Lock CMT to earn rewards
2. **Governance Voting**: Token holders vote on proposals
3. **Premium Features**: Use CMT for enhanced visibility
4. **Referral Rewards**: Earn tokens for bringing new users
5. **Achievement System**: Token rewards for milestones

### **Integration Roadmap**
- [ ] Wallet integration improvements
- [ ] Mobile app token support
- [ ] Cross-chain bridge capabilities
- [ ] DeFi integration opportunities

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm run test

# Deploy to localhost
npm run deploy

# Deploy to testnet
npm run deploy:sepolia

# Start local node
npm run node
```

## 📝 Environment Variables

```env
# Required for deployment
NEXT_PUBLIC_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=your_private_key_here
SEPOLIA_URL=https://sepolia.infura.io/v3/your_key
```

## 🎯 Getting Started

1. **Deploy the Token**: Follow the deployment process above
2. **Update Environment**: Set the token address in your `.env` file
3. **Test Integration**: Use the test API endpoints to verify functionality
4. **Monitor Transactions**: Check the transaction history for CMT rewards

The CMT token system is now fully integrated into your Co-Mission platform, providing a comprehensive token economy for freelancers, employers, and the platform itself! 🚀
