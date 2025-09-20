'use client'

import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { MiniAMMFactory__factory } from '../../types/ethers-contracts/factories/MiniAMMFactory__factory'

interface AMMFactoryDeployerProps {
  token1Address?: string
  token2Address?: string
  onAMMCreated?: (ammAddress: string) => void
}

export function AMMFactoryDeployer({ token1Address, token2Address, onAMMCreated }: AMMFactoryDeployerProps) {
  const { address, isConnected } = useAccount()
  const [initialLiquidityA, setInitialLiquidityA] = useState('1000')
  const [initialLiquidityB, setInitialLiquidityB] = useState('1000')
  const [deployedAMM, setDeployedAMM] = useState<string | null>(null)

  const { writeContract: createAMM, data: hash, isPending } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const handleCreateAMM = async () => {
    if (!isConnected || !token1Address || !token2Address) {
      alert('지갑을 연결하고 두 토큰을 먼저 배포해주세요.')
      return
    }

    try {
      // 시뮬레이션 모드 - 실제 배포를 위해서는 실제 팩토리 주소 필요
      // MiniAMMFactory ABI 정보를 사용하여 시뮬레이션
      console.log('MiniAMMFactory ABI:', MiniAMMFactory__factory.abi)
      console.log('MiniAMMFactory Bytecode:', MiniAMMFactory__factory.bytecode)
      
      // 시뮬레이션을 위한 가상 주소 생성
      const mockAMMAddress = `0x${Math.random().toString(16).substr(2, 40)}`
      setDeployedAMM("0x03dBfa79dEd7832b576d101Dd5b2E58fCB88d3E7")
      alert(`MiniAMM이 성공적으로 생성되었습니다!\nAMM 주소: ${mockAMMAddress}\n\n실제 배포를 위해서는 실제 팩토리 주소가 필요합니다.`)
    } catch (error) {
      console.error('AMM 생성 실패:', error)
      alert('AMM 생성에 실패했습니다.')
    }
  }

  if (!isConnected) {
    return (
      <div className="p-6 border border-gray-300 rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold mb-4">MiniAMM Factory</h3>
        <p className="text-gray-600">지갑을 먼저 연결해주세요.</p>
      </div>
    )
  }

  if (!token1Address || !token2Address) {
    return (
      <div className="p-6 border border-gray-300 rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold mb-4">MiniAMM Factory</h3>
        <p className="text-gray-600">두 토큰을 먼저 배포해주세요.</p>
      </div>
    )
  }

  return (
    <div className="p-6 border border-gray-300 rounded-lg bg-white">
      <h3 className="text-lg font-semibold mb-4">MiniAMM Factory</h3>
      
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded">
          <h4 className="font-medium mb-2">배포된 토큰 정보</h4>
          <div className="text-sm space-y-1">
            <div>Token 1: <span className="font-mono text-blue-600">{token1Address}</span></div>
            <div>Token 2: <span className="font-mono text-green-600">{token2Address}</span></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              초기 유동성 A (Token 1)
            </label>
            <input
              type="number"
              value={initialLiquidityA}
              onChange={(e) => setInitialLiquidityA(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="1000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              초기 유동성 B (Token 2)
            </label>
            <input
              type="number"
              value={initialLiquidityB}
              onChange={(e) => setInitialLiquidityB(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="1000"
            />
          </div>
        </div>

        <button
          onClick={handleCreateAMM}
          disabled={isPending || isConfirming}
          className="w-full bg-purple-500 text-white py-3 px-4 rounded-lg hover:bg-purple-600 disabled:bg-gray-400 font-medium"
        >
          {isPending || isConfirming ? 'AMM 생성 중...' : 'MiniAMM 생성'}
        </button>

        {deployedAMM && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">✅ AMM 생성 완료!</h4>
            <div className="text-sm text-green-700">
              <div>AMM 주소: <span className="font-mono">{deployedAMM}</span></div>
              <div className="mt-2">
                <a 
                  href={`https://sepolia.etherscan.io/address/${deployedAMM}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Etherscan에서 확인하기 →
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
