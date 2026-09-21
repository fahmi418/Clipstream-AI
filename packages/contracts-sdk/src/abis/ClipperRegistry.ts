export const clipperRegistryAbi = [
  {
    type: 'function',
    name: 'recordResult',
    inputs: [
      { name: 'clipper', type: 'address', internalType: 'address' },
      { name: 'campaignId', type: 'uint256', internalType: 'uint256' },
      { name: 'success', type: 'bool', internalType: 'bool' },
      { name: 'views', type: 'uint32', internalType: 'uint32' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'approvalRate',
    inputs: [{ name: 'clipper', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'uint16', internalType: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getClipper',
    inputs: [{ name: 'clipper', type: 'address', internalType: 'address' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct IClipperRegistry.ClipperRecord',
        components: [
          { name: 'totalClips', type: 'uint32', internalType: 'uint32' },
          { name: 'successfulClips', type: 'uint32', internalType: 'uint32' },
          { name: 'flaggedClips', type: 'uint32', internalType: 'uint32' },
          { name: 'totalViewsVerified', type: 'uint64', internalType: 'uint64' },
          { name: 'firstClipAt', type: 'uint64', internalType: 'uint64' },
          { name: 'lastClipAt', type: 'uint64', internalType: 'uint64' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'event',
    name: 'ClipperUpdated',
    inputs: [
      { name: 'clipper', type: 'address', indexed: true, internalType: 'address' },
      { name: 'successfulClips', type: 'uint32', indexed: false, internalType: 'uint32' },
      { name: 'totalClips', type: 'uint32', indexed: false, internalType: 'uint32' },
      { name: 'approvalRateBps', type: 'uint16', indexed: false, internalType: 'uint16' },
    ],
    anonymous: false,
  },
] as const;
