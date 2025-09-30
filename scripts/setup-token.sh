#!/bin/bash

echo "🪙 Setting up CoMission Token (CMT) System"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install ethers

echo "📁 Creating contracts directory..."
mkdir -p contracts

echo "📁 Creating scripts directory..."
mkdir -p scripts

echo "📁 Creating docs directory..."
mkdir -p docs

echo "🔧 Setting up Hardhat..."
cd contracts
npm init -y
npm install --save-dev @nomicfoundation/hardhat-toolbox @openzeppelin/contracts hardhat dotenv

echo "📝 Creating .env template..."
cat > ../.env.example << EOF
# Token Configuration
NEXT_PUBLIC_TOKEN_ADDRESS=
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545

# Deployment (optional)
PRIVATE_KEY=your_private_key_here
SEPOLIA_URL=https://sepolia.infura.io/v3/your_key
EOF

echo "✅ Token system setup complete!"
echo ""
echo "🚀 Next steps:"
echo "1. Copy .env.example to .env and fill in your values"
echo "2. cd contracts && npm run compile"
echo "3. npm run node (in one terminal)"
echo "4. npm run deploy (in another terminal)"
echo "5. Update NEXT_PUBLIC_TOKEN_ADDRESS in your .env file"
echo ""
echo "📚 For detailed instructions, see docs/TOKEN_SYSTEM.md"
