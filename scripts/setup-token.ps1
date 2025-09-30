# CoMission Token (CMT) Setup Script
Write-Host "🪙 Setting up CoMission Token (CMT) System" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Installing dependencies..." -ForegroundColor Green
npm install ethers

Write-Host "📁 Creating directories..." -ForegroundColor Green
New-Item -ItemType Directory -Force -Path "contracts" | Out-Null
New-Item -ItemType Directory -Force -Path "scripts" | Out-Null
New-Item -ItemType Directory -Force -Path "docs" | Out-Null

Write-Host "🔧 Setting up Hardhat..." -ForegroundColor Green
Set-Location contracts
npm init -y | Out-Null
npm install --save-dev @nomicfoundation/hardhat-toolbox @openzeppelin/contracts hardhat dotenv

Write-Host "📝 Creating .env template..." -ForegroundColor Green
Set-Location ..
$envContent = @"
# Token Configuration
NEXT_PUBLIC_TOKEN_ADDRESS=
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545

# Deployment (optional)
PRIVATE_KEY=your_private_key_here
SEPOLIA_URL=https://sepolia.infura.io/v3/your_key
"@

$envContent | Out-File -FilePath ".env.example" -Encoding UTF8

Write-Host "✅ Token system setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Cyan
Write-Host "1. Copy .env.example to .env and fill in your values" -ForegroundColor White
Write-Host "2. cd contracts && npm run compile" -ForegroundColor White
Write-Host "3. npm run node (in one terminal)" -ForegroundColor White
Write-Host "4. npm run deploy (in another terminal)" -ForegroundColor White
Write-Host "5. Update NEXT_PUBLIC_TOKEN_ADDRESS in your .env file" -ForegroundColor White
Write-Host ""
Write-Host "📚 For detailed instructions, see docs/TOKEN_SYSTEM.md" -ForegroundColor Cyan
