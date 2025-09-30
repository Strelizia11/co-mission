// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/**
 * @title CoMissionToken (CMT)
 * @dev ERC-20 token for the Co-Mission platform
 * Features:
 * - Standard ERC-20 functionality
 * - Burnable tokens
 * - Owner can mint new tokens
 * - Permit functionality for gasless approvals
 * - Platform-specific reward mechanisms
 */
contract CoMissionToken is ERC20, ERC20Burnable, Ownable, ERC20Permit {
    // Token details
    uint256 public constant INITIAL_SUPPLY = 1000000 * 10**18; // 1 million CMT
    uint256 public constant MAX_SUPPLY = 10000000 * 10**18; // 10 million CMT max
    
    // Platform addresses
    address public platformTreasury;
    address public rewardPool;
    
    // Reward tracking
    mapping(address => uint256) public taskRewards;
    mapping(address => uint256) public reputationScore;
    
    // Events
    event TaskRewardDistributed(address indexed freelancer, uint256 amount, string taskId);
    event ReputationUpdated(address indexed user, uint256 newScore);
    event PlatformFeeCollected(uint256 amount);
    
    constructor(
        address _platformTreasury,
        address _rewardPool
    ) ERC20("CoMission Token", "CMT") ERC20Permit("CoMission Token") {
        platformTreasury = _platformTreasury;
        rewardPool = _rewardPool;
        
        // Mint initial supply to platform treasury
        _mint(_platformTreasury, INITIAL_SUPPLY);
    }
    
    /**
     * @dev Mint new tokens (only owner)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
        _mint(to, amount);
    }
    
    /**
     * @dev Distribute task completion reward
     * @param freelancer Address of the freelancer
     * @param amount Reward amount in CMT
     * @param taskId Task identifier
     */
    function distributeTaskReward(
        address freelancer, 
        uint256 amount, 
        string memory taskId
    ) external onlyOwner {
        require(freelancer != address(0), "Invalid freelancer address");
        require(amount > 0, "Reward amount must be positive");
        
        // Transfer from reward pool
        _transfer(rewardPool, freelancer, amount);
        
        // Update tracking
        taskRewards[freelancer] += amount;
        
        emit TaskRewardDistributed(freelancer, amount, taskId);
    }
    
    /**
     * @dev Update user reputation score
     * @param user User address
     * @param score New reputation score
     */
    function updateReputation(address user, uint256 score) external onlyOwner {
        require(user != address(0), "Invalid user address");
        reputationScore[user] = score;
        emit ReputationUpdated(user, score);
    }
    
    /**
     * @dev Collect platform fee
     * @param amount Fee amount
     */
    function collectPlatformFee(uint256 amount) external onlyOwner {
        require(amount > 0, "Fee amount must be positive");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        _transfer(msg.sender, platformTreasury, amount);
        emit PlatformFeeCollected(amount);
    }
    
    /**
     * @dev Get user's total earnings from tasks
     * @param user User address
     * @return Total task rewards earned
     */
    function getTotalTaskRewards(address user) external view returns (uint256) {
        return taskRewards[user];
    }
    
    /**
     * @dev Get user's reputation score
     * @param user User address
     * @return User's reputation score
     */
    function getReputationScore(address user) external view returns (uint256) {
        return reputationScore[user];
    }
    
    /**
     * @dev Update platform addresses
     * @param _platformTreasury New treasury address
     * @param _rewardPool New reward pool address
     */
    function updatePlatformAddresses(
        address _platformTreasury,
        address _rewardPool
    ) external onlyOwner {
        require(_platformTreasury != address(0), "Invalid treasury address");
        require(_rewardPool != address(0), "Invalid reward pool address");
        
        platformTreasury = _platformTreasury;
        rewardPool = _rewardPool;
    }
}
