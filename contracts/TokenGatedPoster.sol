// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenGatedPoster is Ownable {
    address public tokenAddress;
    uint256 public threshold;

    event NewPost(address indexed user, string content, string indexed tag);

    constructor(address initialTokenAddress, uint256 initialThreshold) {
        tokenAddress = initialTokenAddress;
        threshold = initialThreshold;
    }

    function post(string memory content, string memory tag) public {
        uint256 balance = IERC20(tokenAddress).balanceOf(msg.sender);
        require(balance >= threshold, "Not enough tokens");
        emit NewPost(msg.sender, content, tag);
    }

    function setTokenAddress(address newTokenAddress) external onlyOwner {
        tokenAddress = newTokenAddress;
    }

    function setThreshold(uint256 newThreshold) external onlyOwner {
        threshold = newThreshold;
    }
}
