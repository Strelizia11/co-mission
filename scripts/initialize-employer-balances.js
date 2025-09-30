const fs = require('fs');
const path = require('path');

// Paths to data files
const USERS_FILE = path.join(process.cwd(), 'users.json');
const TOKEN_BALANCES_FILE = path.join(process.cwd(), 'token-balances.json');

// Read users from file
function getUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    console.log('No users.json file found');
    return [];
  }
  const data = fs.readFileSync(USERS_FILE, 'utf-8');
  return JSON.parse(data);
}

// Read token balances from file
function getTokenBalances() {
  if (!fs.existsSync(TOKEN_BALANCES_FILE)) {
    return {};
  }
  const data = fs.readFileSync(TOKEN_BALANCES_FILE, 'utf-8');
  return JSON.parse(data);
}

// Save token balances to file
function saveTokenBalances(balances) {
  fs.writeFileSync(TOKEN_BALANCES_FILE, JSON.stringify(balances, null, 2));
}

// Initialize CMT balances for all employers
function initializeEmployerBalances() {
  console.log('🪙 Initializing CMT balances for all employers...');
  
  // Get all users
  const users = getUsers();
  const employers = users.filter(user => user.role === 'employer');
  
  if (employers.length === 0) {
    console.log('❌ No employers found');
    return;
  }
  
  console.log(`📊 Found ${employers.length} employers`);
  
  // Get current token balances
  const tokenBalances = getTokenBalances();
  let initializedCount = 0;
  let alreadyInitializedCount = 0;
  
  for (const employer of employers) {
    const existingBalance = tokenBalances[employer.email];
    
    // Check if employer already has CMT balance
    if (existingBalance && parseFloat(existingBalance.balance || '0') > 0) {
      console.log(`✅ ${employer.email} already has ${existingBalance.balance} CMT`);
      alreadyInitializedCount++;
      continue;
    }
    
    // Initialize with 20 CMT
    tokenBalances[employer.email] = {
      balance: '20.0',
      taskRewards: '0.0',
      reputationScore: '5.0',
      initializedAt: new Date().toISOString(),
      userEmail: employer.email,
      userRole: 'employer',
      lastUpdated: new Date().toISOString()
    };
    
    console.log(`🪙 Initialized 20 CMT for ${employer.email}`);
    initializedCount++;
  }
  
  // Save updated balances
  saveTokenBalances(tokenBalances);
  
  console.log('\n📈 Summary:');
  console.log(`✅ Initialized: ${initializedCount} employers`);
  console.log(`ℹ️  Already had balance: ${alreadyInitializedCount} employers`);
  console.log(`📊 Total employers: ${employers.length}`);
  
  // Show final balances
  console.log('\n💰 Final CMT Balances:');
  for (const employer of employers) {
    const balance = tokenBalances[employer.email];
    console.log(`   ${employer.email}: ${balance.balance} CMT`);
  }
}

// Run the initialization
try {
  initializeEmployerBalances();
  console.log('\n🎉 CMT balance initialization completed successfully!');
} catch (error) {
  console.error('❌ Error initializing CMT balances:', error);
  process.exit(1);
}
