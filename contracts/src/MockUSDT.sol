// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// Testnet-only token. Public mint lets anyone get tokens for testing.
/// 6 decimals to match real USDT.
contract MockUSDT is ERC20 {
    uint8 private constant DECIMALS = 6;

    constructor() ERC20("Mock USDT", "USDT") {}

    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }

    /// No access control -- testnet only. Production would remove this.
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
