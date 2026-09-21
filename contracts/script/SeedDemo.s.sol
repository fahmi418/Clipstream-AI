// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Script, console } from "forge-std/Script.sol";
import { MockUSDT } from "../src/MockUSDT.sol";
import { CampaignEscrow } from "../src/CampaignEscrow.sol";

/// Seeds 2 demo campaigns on testnet. Run after Deploy.s.sol.
contract SeedDemo is Script {
    function run() external {
        uint256 brandKey = vm.envUint("BRAND_PRIVATE_KEY");
        address escrowAddr = vm.envAddress("ESCROW_ADDRESS");
        address usdtAddr = vm.envAddress("MOCK_USDT_ADDRESS");

        address brand = vm.addr(brandKey);
        CampaignEscrow escrow = CampaignEscrow(payable(escrowAddr));
        MockUSDT usdt = MockUSDT(usdtAddr);

        vm.startBroadcast(brandKey);

        // Mint USDT for brand
        usdt.mint(brand, 100_000 * 1e6);
        usdt.approve(escrowAddr, type(uint256).max);

        // Campaign 1: podcast, happy path demo (USDT)
        uint256 campaign1 = escrow.createCampaign(
            usdtAddr,
            50_000_000,               // 50 USDT
            300_000,                   // 0.30 USDT per 1k views
            15_000_000,                // cap 15 USDT per clip
            1000,                      // min 1000 views
            uint64(block.timestamp + 14 days),
            keccak256("podcast-bincang-teknologi-ep42"),
            keccak256("tanpa-sara-tanpa-klaim-medis")
        );
        console.log("Campaign 1 (podcast - USDT) ID:", campaign1);

        // Campaign 2: F&B brand, brand safety demo (USDT)
        uint256 campaign2 = escrow.createCampaign(
            usdtAddr,
            30_000_000,               // 30 USDT
            500_000,                   // 0.50 USDT per 1k views
            10_000_000,                // cap 10 USDT per clip
            2000,                      // min 2000 views
            uint64(block.timestamp + 10 days),
            keccak256("kopi-nusantara-rasa-baru"),
            keccak256("tanpa-kompetitor-tanpa-klaim-kesehatan")
        );
        console.log("Campaign 2 (F&B - USDT) ID:", campaign2);

        // Campaign 3: Web3 Creator campaign (Native BNB)
        uint128 bnbBudget = 0.5 ether; // 0.5 BNB
        if (brand.balance >= bnbBudget) {
            uint256 campaign3 = escrow.createCampaign{value: bnbBudget}(
                address(0),
                bnbBudget,
                0.005 ether,            // 0.005 BNB per 1k views
                0.2 ether,              // cap 0.2 BNB per clip
                500,                    // min 500 views
                uint64(block.timestamp + 21 days),
                keccak256("clipstream-launch-campaign"),
                keccak256("web3-social-indonesia-creative")
            );
            console.log("Campaign 3 (Native BNB) ID:", campaign3);
        }

        vm.stopBroadcast();
    }
}
