// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Script, console } from "forge-std/Script.sol";
import { MockUSDT } from "../src/MockUSDT.sol";
import { ClipperRegistry } from "../src/ClipperRegistry.sol";
import { CampaignEscrow } from "../src/CampaignEscrow.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address agent = vm.envAddress("AGENT_ADDRESS");
        address deployer = vm.addr(deployerKey);

        vm.startBroadcast(deployerKey);

        MockUSDT usdt = new MockUSDT();
        console.log("MockUSDT deployed at:", address(usdt));

        ClipperRegistry registry = new ClipperRegistry();
        console.log("ClipperRegistry deployed at:", address(registry));

        CampaignEscrow escrow = new CampaignEscrow(deployer, agent, address(registry));
        console.log("CampaignEscrow deployed at:", address(escrow));

        registry.setEscrow(address(escrow));
        escrow.setTokenAllowed(address(usdt), true);

        // Mint test tokens to deployer for seeding
        usdt.mint(deployer, 1_000_000 * 1e6);

        vm.stopBroadcast();

        console.log("--- Deployment Summary ---");
        console.log("Chain ID:", block.chainid);
        console.log("Deployer:", deployer);
        console.log("Agent:", agent);
    }
}
