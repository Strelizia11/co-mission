const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying CoMission Token (CMT)...");
  
  // Get the contract factory
  const CoMissionToken = await ethers.getContractFactory("CoMissionToken");
  
  // Deploy the contract
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());
  
  // Set platform addresses (using deployer for now, can be changed later)
  const platformTreasury = deployer.address;
  const rewardPool = deployer.address;
  
  const token = await CoMissionToken.deploy(platformTreasury, rewardPool);
  await token.deployed();
  
  console.log("✅ CoMission Token deployed to:", token.address);
  console.log("📊 Initial Supply:", ethers.utils.formatEther(await token.totalSupply()), "CMT");
  console.log("🏦 Platform Treasury:", platformTreasury);
  console.log("🎁 Reward Pool:", rewardPool);
  
  // Save deployment info
  const deploymentInfo = {
    network: "localhost", // or your network
    tokenAddress: token.address,
    platformTreasury: platformTreasury,
    rewardPool: rewardPool,
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };
  
  const fs = require('fs');
  fs.writeFileSync(
    'deployment-info.json', 
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("💾 Deployment info saved to deployment-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
