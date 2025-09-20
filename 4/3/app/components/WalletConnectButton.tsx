'use client'

import { useAccount, useBalance } from 'wagmi'
import { useState, useEffect } from 'react'

export function WalletConnectButton() {
  const { address, isConnected, chain } = useAccount()
  const { data: balance } = useBalance({
    address: address,
  })
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const formatBalance = (balance: bigint, decimals: number) => {
    const formatted = (Number(balance) / Math.pow(10, decimals)).toFixed(4)
    return `${formatted} ETH`
  }

  if (!isMounted) {
    return (
      <div className="flex flex-col gap-2">
        <button
          disabled
          className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-gray-300 text-gray-500 gap-2 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto cursor-not-allowed"
        >
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
          로딩 중...
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Use AppKit web component as recommended in the documentation */}
      <appkit-button />
      
      {isConnected && (
        <div className="text-center text-xs text-gray-600 dark:text-gray-400">
          <div className="font-medium">{chain?.name}</div>
          {balance && (
            <div>{formatBalance(balance.value, balance.decimals)}</div>
          )}
        </div>
      )}
    </div>
  )
}
