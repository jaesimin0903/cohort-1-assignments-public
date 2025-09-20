import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { defineChain } from 'viem'

// Flare Testnet Coston2 네트워크 정의
export const flareCoston2 = defineChain({
  id: 114,
  name: 'Flare Testnet Coston2',
  nativeCurrency: {
    name: 'C2FLR',
    symbol: 'C2FLR',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://coston2-api.flare.network/ext/C/rpc'],
      webSocket: ['wss://coston2-api.flare.network/ext/C/ws'],
    },
    public: {
      http: [
        'https://coston2-api.flare.network/ext/C/rpc',
        'https://falling-skilled-uranium.flare-coston2.quiknode.pro/ext/bc/C/rpc'
      ],
      webSocket: [
        'wss://coston2-api.flare.network/ext/C/ws',
        'wss://falling-skilled-uranium.flare-coston2.quiknode.pro/ext/bc/C/ws'
      ],
    },
  },
  blockExplorers: {
    default: {
      name: 'FlareScan',
      url: 'https://coston2.testnet.flarescan.com',
    },
    blockscout: {
      name: 'Blockscout',
      url: 'https://coston2-explorer.flare.network',
    },
    systems: {
      name: 'Systems Explorer',
      url: 'https://coston2-systems-explorer.flare.network',
    },
  },
  testnet: true,
})

// Get projectId from https://dashboard.reown.com
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '9a235cc4ac36e0eaf8ff8755dc650c43'

export const networks = [flareCoston2]

//Set up the Wagmi Adapter (Config) - Flare Testnet Coston2만 사용
export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [flareCoston2]
})

export const config = wagmiAdapter.wagmiConfig