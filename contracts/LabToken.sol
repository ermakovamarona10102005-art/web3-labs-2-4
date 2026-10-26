// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LabToken is ERC20, Ownable {
    constructor(string memory tokenName, string memory tokenSymbol, uint256 initialSupply)
        ERC20(tokenName, tokenSymbol)
    {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }

    function mint(address recipient, uint256 amount) external onlyOwner {
        _mint(recipient, amount);
    }
}
