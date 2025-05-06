// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
interface IERC20Burnable {
    function burn(uint256 amount) external;
}

interface IERC20Account {
    function allowanceERC20(IERC20 tokenContract, address spender) external view returns (uint256);
    function approveERC20(IERC20 tokenContract, address spender, uint256 value) external returns (bool);
    function balanceERC20(IERC20 tokenContract) external view returns (uint256);
    function transferERC20(IERC20 tokenContract, address to, uint256 amount) external returns (bool);
    function burnERC20(IERC20Burnable tokenContract, uint256 amount) external returns (bool);
}
  
