// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { ICampaignEscrow } from "../interfaces/ICampaignEscrow.sol";
import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import { MessageHashUtils } from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/// EIP-712 hashing and signature recovery for Attestation structs.
/// Separated from CampaignEscrow to keep the main contract readable
/// and make the typehash testable in isolation.
library AttestationLib {
    bytes32 internal constant ATTESTATION_TYPEHASH = keccak256(
        "Attestation("
        "uint256 clipId,"
        "uint256 campaignId,"
        "address clipper,"
        "bytes32 videoIdHash,"
        "uint32 verifiedViews,"
        "uint16 sourceMatchBps,"
        "uint16 safetyBps,"
        "uint16 anomalyBps,"
        "bytes32 evidenceHash,"
        "uint256 nonce,"
        "uint64 expiry"
        ")"
    );

    function hashAttestation(ICampaignEscrow.Attestation calldata att) internal pure returns (bytes32) {
        return keccak256(
            abi.encode(
                ATTESTATION_TYPEHASH,
                att.clipId,
                att.campaignId,
                att.clipper,
                att.videoIdHash,
                att.verifiedViews,
                att.sourceMatchBps,
                att.safetyBps,
                att.anomalyBps,
                att.evidenceHash,
                att.nonce,
                att.expiry
            )
        );
    }

    function buildDomainSeparator(address verifyingContract) internal view returns (bytes32) {
        return keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256("ClipStream"),
                keccak256("1"),
                block.chainid,
                verifyingContract
            )
        );
    }

    function recoverSigner(
        ICampaignEscrow.Attestation calldata att,
        bytes calldata signature,
        bytes32 domainSeparator
    ) internal pure returns (address) {
        bytes32 structHash = hashAttestation(att);
        bytes32 digest = MessageHashUtils.toTypedDataHash(domainSeparator, structHash);
        return ECDSA.recover(digest, signature);
    }
}
