import { privateKeyToAccount } from 'viem/accounts';
import type { AttestationMessage } from '@clipstream/shared';
import { ATTESTATION_EIP712_TYPES } from '@clipstream/shared';

export interface EIP712DomainConfig {
  chainId: number;
  verifyingContract: `0x${string}`;
}

export class AgentSigner {
  private readonly account: ReturnType<typeof privateKeyToAccount>;
  private readonly domain: {
    name: 'ClipStream';
    version: '1';
    chainId: number;
    verifyingContract: `0x${string}`;
  };

  constructor(privateKey: `0x${string}`, domainConfig: EIP712DomainConfig) {
    this.account = privateKeyToAccount(privateKey);
    this.domain = {
      name: 'ClipStream',
      version: '1',
      chainId: domainConfig.chainId,
      verifyingContract: domainConfig.verifyingContract,
    };
  }

  get address(): `0x${string}` {
    return this.account.address;
  }

  async signAttestation(attestation: AttestationMessage): Promise<`0x${string}`> {
    return this.account.signTypedData({
      domain: this.domain,
      types: ATTESTATION_EIP712_TYPES,
      primaryType: 'Attestation',
      message: attestation,
    });
  }
}
