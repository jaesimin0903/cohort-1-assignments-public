'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { parseEther, formatUnits, parseUnits } from 'viem'
import { MiniAMM__factory } from '../../types/ethers-contracts/factories/MiniAMM__factory'
import { MockERC20__factory } from '../../types/ethers-contracts/factories/MockERC20__factory'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { ArrowUpDown, RefreshCw, Zap, Coins } from 'lucide-react'

interface SwapInterfaceProps {
  token1Address?: string
  token2Address?: string
}

export function SwapInterface({ token1Address, token2Address }: SwapInterfaceProps) {
  const { address, isConnected, chain } = useAccount()

  // 네트워크 상태 디버깅
  useEffect(() => {
    console.log('🌐 네트워크 상태:', {
      address,
      isConnected,
      chain: chain?.name,
      chainId: chain?.id
    })
  }, [address, isConnected, chain])
  const [swapAmount, setSwapAmount] = useState('')
  const [removeAmount, setRemoveAmount] = useState('')
  const [swapDirection, setSwapDirection] = useState<'token1ToToken2' | 'token2ToToken1'>('token1ToToken2')
  const [ammAddress, setAmmAddress] = useState<string | null>(null)
  const [calculatedOutput, setCalculatedOutput] = useState<string>('')
  const [isCalculating, setIsCalculating] = useState(false)

  interface ContractErrorDetails {
    message: string
    code?: string | number
    data?: unknown
    stack?: string
  }

  const extractContractError = (error: unknown): ContractErrorDetails => {
    if (error instanceof Error) {
      const enriched = error as Error & { code?: string | number; data?: unknown }
      return {
        message: enriched.message,
        code: enriched.code,
        data: enriched.data,
        stack: enriched.stack
      }
    }

    if (typeof error === 'object' && error !== null) {
      const possibleError = error as { message?: unknown; code?: unknown; data?: unknown; stack?: unknown }
      return {
        message: typeof possibleError.message === 'string' ? possibleError.message : 'Unknown error',
        code: typeof possibleError.code === 'string' || typeof possibleError.code === 'number' ? possibleError.code : undefined,
        data: possibleError.data,
        stack: typeof possibleError.stack === 'string' ? possibleError.stack : undefined
      }
    }

    return {
      message: typeof error === 'string' ? error : JSON.stringify(error)
    }
  }

  const { writeContract: swap, data: swapHash, isPending: isSwapping, error: swapError } = useWriteContract()
  const { writeContract: addLiquidity, data: liquidityHash, isPending: isAddingLiquidity, error: liquidityError } = useWriteContract()
  const { writeContract: removeLiquidity, data: removeHash, isPending: isRemovingLiquidity, error: removeError } = useWriteContract()
  const { writeContract: approveToken1, isPending: isApproving1 } = useWriteContract()
  const { writeContract: approveToken2, isPending: isApproving2 } = useWriteContract()

  // 트랜잭션 해시 디버깅
  useEffect(() => {
    console.log('🔍 Swap Hash 상태:', {
      swapHash,
      isSwapping,
      swapError
    })
  }, [swapHash, isSwapping, swapError])

  useEffect(() => {
    console.log('🔍 Liquidity Hash 상태:', {
      liquidityHash,
      isAddingLiquidity,
      liquidityError
    })
  }, [liquidityHash, isAddingLiquidity, liquidityError])

  useEffect(() => {
    console.log('🔍 Remove Liquidity Hash 상태:', {
      removeHash,
      isRemovingLiquidity,
      removeError
    })
  }, [removeHash, isRemovingLiquidity, removeError])

  const { isLoading: isSwapConfirming, isSuccess: isSwapConfirmed, data: swapReceipt, error: swapReceiptError } = useWaitForTransactionReceipt({
    hash: swapHash,
    query: {
      enabled: !!swapHash, // 해시가 있을 때만 실행
      retry: 3, // 재시도 횟수
      retryDelay: 1000 // 재시도 간격 (1초)
    }
  })

  // Swap Receipt 상태 디버깅
  useEffect(() => {
    console.log('🔍 Swap Receipt 상태:', {
      swapHash,
      isSwapConfirming,
      isSwapConfirmed,
      swapReceipt,
      swapReceiptError
    })
  }, [swapHash, isSwapConfirming, isSwapConfirmed, swapReceipt, swapReceiptError])

  // Swap receipt 콘솔 출력
  useEffect(() => {
    if (swapReceipt) {
      console.log('🎉 Swap Receipt:', swapReceipt)
      console.log('📋 Swap Receipt 상세 정보:', {
        transactionHash: swapReceipt.transactionHash,
        blockNumber: swapReceipt.blockNumber,
        blockHash: swapReceipt.blockHash,
        gasUsed: swapReceipt.gasUsed?.toString(),
        effectiveGasPrice: swapReceipt.effectiveGasPrice?.toString(),
        status: swapReceipt.status,
        logs: swapReceipt.logs?.length || 0
      })
      
      // 이벤트 로그 분석
      if (swapReceipt.logs && swapReceipt.logs.length > 0) {
        console.log('📝 Swap 이벤트 로그:', swapReceipt.logs)
        swapReceipt.logs.forEach((log, index) => {
          console.log(`📄 Swap 로그 ${index + 1}:`, {
            address: log.address,
            topics: log.topics,
            data: log.data,
            blockNumber: log.blockNumber,
            transactionHash: log.transactionHash,
            logIndex: log.logIndex
          })
        })
      }
    }
  }, [swapReceipt])

  const { isLoading: isLiquidityConfirming, isSuccess: isLiquidityConfirmed, data: liquidityReceipt, error: liquidityReceiptError } = useWaitForTransactionReceipt({
    hash: liquidityHash,
    query: {
      enabled: !!liquidityHash, // 해시가 있을 때만 실행
      retry: 3, // 재시도 횟수
      retryDelay: 1000 // 재시도 간격 (1초)
    }
  })

  const { isLoading: isRemoveConfirming, isSuccess: isRemoveConfirmed, data: removeReceipt, error: removeReceiptError } = useWaitForTransactionReceipt({
    hash: removeHash,
    query: {
      enabled: !!removeHash,
      retry: 3,
      retryDelay: 1000
    }
  })

  // Liquidity Receipt 상태 디버깅
  useEffect(() => {
    console.log('🔍 Liquidity Receipt 상태:', {
      liquidityHash,
      isLiquidityConfirming,
      isLiquidityConfirmed,
      liquidityReceipt,
      liquidityReceiptError
    })
  }, [liquidityHash, isLiquidityConfirming, isLiquidityConfirmed, liquidityReceipt, liquidityReceiptError])

  // 유동성 추가 receipt 콘솔 출력
  useEffect(() => {
    if (liquidityReceipt) {
      console.log('🎉 유동성 추가 Receipt:', liquidityReceipt)
      console.log('📋 Receipt 상세 정보:', {
        transactionHash: liquidityReceipt.transactionHash,
        blockNumber: liquidityReceipt.blockNumber,
        blockHash: liquidityReceipt.blockHash,
        gasUsed: liquidityReceipt.gasUsed?.toString(),
        effectiveGasPrice: liquidityReceipt.effectiveGasPrice?.toString(),
        status: liquidityReceipt.status,
        logs: liquidityReceipt.logs?.length || 0
      })
      
      // 이벤트 로그 분석
      if (liquidityReceipt.logs && liquidityReceipt.logs.length > 0) {
        console.log('📝 이벤트 로그:', liquidityReceipt.logs)
        liquidityReceipt.logs.forEach((log, index) => {
          console.log(`📄 로그 ${index + 1}:`, {
            address: log.address,
            topics: log.topics,
            data: log.data,
            blockNumber: log.blockNumber,
            transactionHash: log.transactionHash,
            logIndex: log.logIndex
          })
        })
      }
    }
  }, [liquidityReceipt])

  useEffect(() => {
    console.log('🔍 Remove Liquidity Receipt 상태:', {
      removeHash,
      isRemoveConfirming,
      isRemoveConfirmed,
      removeReceipt,
      removeReceiptError
    })
  }, [removeHash, isRemoveConfirming, isRemoveConfirmed, removeReceipt, removeReceiptError])

  useEffect(() => {
    if (removeReceipt) {
      console.log('🎉 유동성 제거 Receipt:', removeReceipt)
      console.log('📋 유동성 제거 상세 정보:', {
        transactionHash: removeReceipt.transactionHash,
        blockNumber: removeReceipt.blockNumber,
        blockHash: removeReceipt.blockHash,
        gasUsed: removeReceipt.gasUsed?.toString(),
        effectiveGasPrice: removeReceipt.effectiveGasPrice?.toString(),
        status: removeReceipt.status,
        logs: removeReceipt.logs?.length || 0
      })

      if (removeReceipt.logs && removeReceipt.logs.length > 0) {
        console.log('📝 유동성 제거 이벤트 로그:', removeReceipt.logs)
        removeReceipt.logs.forEach((log, index) => {
          console.log(`📄 Remove 로그 ${index + 1}:`, {
            address: log.address,
            topics: log.topics,
            data: log.data,
            blockNumber: log.blockNumber,
            transactionHash: log.transactionHash,
            logIndex: log.logIndex
          })
        })
      }
    }
  }, [removeReceipt])

  useEffect(() => {
    if (isRemoveConfirmed) {
      setRemoveAmount('')
    }
  }, [isRemoveConfirmed])

  // AMM 주소 조회 (시뮬레이션용)
  const [pairAddress, setPairAddress] = useState<string | null>(null)
  
  // 시뮬레이션을 위한 AMM 주소 생성
  useEffect(() => {
    if (token1Address && token2Address) {
      // 실제로는 팩토리에서 조회해야 하지만, 시뮬레이션을 위해 고정 주소 사용
      setPairAddress('0x91CC005c05B9531650160EBdF801468FEd658E53')
    }
  }, [token1Address, token2Address])

  // 토큰 정보 조회
  const { data: token1Symbol } = useReadContract({
    address: token1Address as `0x${string}`,
    abi: MockERC20__factory.abi,
    functionName: 'symbol'
  })

  const { data: token2Symbol } = useReadContract({
    address: token2Address as `0x${string}`,
    abi: MockERC20__factory.abi,
    functionName: 'symbol'
  })

  // AMM 리저브 정보 조회
  const { data: token1Reserve } = useReadContract({
    address: pairAddress as `0x${string}`,
    abi: MiniAMM__factory.abi,
    functionName: 'xReserve'
  })

  const { data: token2Reserve } = useReadContract({
    address: pairAddress as `0x${string}`,
    abi: MiniAMM__factory.abi,
    functionName: 'yReserve'
  })

  // AMM 공식에 따른 스왑 계산 함수
  const calculateSwapOutput = (inputAmount: string, inputReserve: bigint, outputReserve: bigint) => {
    if (!inputAmount || inputAmount === '0' || inputReserve === BigInt(0) || outputReserve === BigInt(0)) {
      return '0'
    }

    const inputAmountWei = parseUnits(inputAmount, 18)
    
    // Constant Product Market Maker 공식: x * y = k
    // output = (input * outputReserve) / (inputReserve + input)
    const numerator = inputAmountWei * outputReserve
    const denominator = inputReserve + inputAmountWei
    
    if (denominator === BigInt(0)) return '0'
    
    const output = numerator / denominator
    
    // 0.3% 수수료 적용 (997/1000)

    const outputWithFee = (output * BigInt(997)) / BigInt(1000)
    
    return formatUnits(outputWithFee, 18)
  }

  // 실시간 계산
  useEffect(() => {
    if (!swapAmount || !token1Reserve || !token2Reserve) {
      setCalculatedOutput('')
      return
    }

    setIsCalculating(true)
    
    try {
      let output = ''
      if (swapDirection === 'token1ToToken2') {
        output = calculateSwapOutput(swapAmount, token1Reserve, token2Reserve)
      } else {
        output = calculateSwapOutput(swapAmount, token2Reserve, token1Reserve)
      }
      
      setCalculatedOutput(output)
    } catch (error) {
      console.error('계산 오류:', error)
      setCalculatedOutput('')
    } finally {
      setIsCalculating(false)
    }
  }, [swapAmount, swapDirection, token1Reserve, token2Reserve])

  // AMM 정보 조회
  const { data: tokenXBalance } = useReadContract({
    address: ammAddress as `0x${string}`,
    abi: MiniAMM__factory.abi,
    functionName: 'balanceOf'
  })

  const { data: tokenYBalance } = useReadContract({
    address: ammAddress as `0x${string}`,
    abi: MiniAMM__factory.abi,
        functionName: 'balanceOf'
  })

  const { data: totalSupply } = useReadContract({
    address: ammAddress as `0x${string}`,
    abi: MiniAMM__factory.abi,
    functionName: 'totalSupply'
  })

  const { data: userLpBalance } = useReadContract({
    address: ammAddress as `0x${string}`,
    abi: MiniAMM__factory.abi,
    functionName: 'balanceOf',
    args: address ? [address as `0x${string}`] : undefined
  })

  // AMM 주소 설정
  useEffect(() => {
    console.log('🏭 AMM 주소 상태:', {
      pairAddress,
      ammAddress,
      isSet: pairAddress && pairAddress !== '0x0000000000000000000000000000000000000000'
    })
    
    if (pairAddress && pairAddress !== '0x0000000000000000000000000000000000000000') {
      setAmmAddress(pairAddress as string)
    }
  }, [pairAddress, ammAddress])

  // Swap 실행
  const handleSwap = async () => {
    if (!isConnected || !ammAddress || !swapAmount) return

    try {
      const amount = parseEther(swapAmount)
      
      console.log('🔄 Swap 시작...')
      console.log('📊 Swap 입력 데이터:', {
        ammAddress,
        swapDirection,
        swapAmount,
        amountWei: amount.toString(),
        args: swapDirection === 'token1ToToken2' ? [amount, BigInt(0)] : [BigInt(0), amount]
      })
      
      if (swapDirection === 'token1ToToken2') {
        await swap({
          address: ammAddress as `0x${string}`,
          abi: MiniAMM__factory.abi,
          functionName: 'swap',
          args: [amount, BigInt(0)] // xAmountIn, yAmountIn
        })
      } else {
        await swap({
          address: ammAddress as `0x${string}`,
          abi: MiniAMM__factory.abi,
          functionName: 'swap',
          args: [BigInt(0), amount] // xAmountIn, yAmountIn
        })
      }
      
      console.log('✅ Swap 트랜잭션 전송 완료')
    } catch (error) {
      console.error('❌ Swap 실패:', error)
      const details = extractContractError(error)
      console.error('🔍 Swap 오류 상세:', details)
      alert('Swap에 실패했습니다. 콘솔을 확인해주세요.')
    }
  }

  // 토큰 승인 함수
  const handleApproveTokens = async () => {
    if (!isConnected || !ammAddress || !token1Address || !token2Address || !swapAmount) return

    try {
      const amount = parseEther(swapAmount)
      const maxAmount = parseEther('1000000') // 충분한 양으로 승인
      
      console.log('🔐 토큰 승인 시작...')
      console.log('📊 승인 데이터:', {
        token1Address,
        token2Address,
        ammAddress,
        amount: swapAmount,
        maxAmount: '1000000'
      })

      // 토큰 잔액 확인
      console.log('💰 토큰 잔액 확인 중...')
      console.log('Token1 잔액:', tokenXBalance ? formatUnits(tokenXBalance, 18) : '로딩 중...')
      console.log('Token2 잔액:', tokenYBalance ? formatUnits(tokenYBalance, 18) : '로딩 중...')
      
      if (tokenXBalance && tokenXBalance < amount) {
        throw new Error(`Token1 잔액 부족: ${formatUnits(tokenXBalance, 18)} < ${swapAmount}`)
      }
      
      if (tokenYBalance && tokenYBalance < amount) {
        throw new Error(`Token2 잔액 부족: ${formatUnits(tokenYBalance, 18)} < ${swapAmount}`)
      }

      // Token1 승인
      console.log('🔐 Token1 승인 중...')
      await approveToken1({
        address: token1Address as `0x${string}`,
        abi: MockERC20__factory.abi,
        functionName: 'approve',
        args: [ammAddress as `0x${string}`, maxAmount]
      })

      // Token2 승인
      console.log('🔐 Token2 승인 중...')
      await approveToken2({
        address: token2Address as `0x${string}`,
        abi: MockERC20__factory.abi,
        functionName: 'approve',
        args: [ammAddress as `0x${string}`, maxAmount]
      })

      console.log('✅ 토큰 승인 완료')
    } catch (error) {
      console.error('❌ 토큰 승인 실패:', error)
      const details = extractContractError(error)
      console.error('🔍 승인 오류 상세:', details)
      alert('토큰 승인에 실패했습니다. 콘솔을 확인해주세요.')
    }
  }

  // 유동성 추가
  const handleAddLiquidity = async () => {
    if (!isConnected || !ammAddress || !swapAmount) return

    try {
      const amount = parseEther(swapAmount)
      
      console.log('🔄 유동성 추가 시작...')
      console.log('📊 입력 데이터:', {
        ammAddress,
        xAmountIn: swapAmount,
        yAmountIn: swapAmount,
        amountWei: amount.toString()
      })
      
      await addLiquidity({
        address: ammAddress as `0x${string}`,
        abi: MiniAMM__factory.abi,
        functionName: 'addLiquidity',
        args: [amount, amount] // xAmountIn, yAmountIn
      })
      
      console.log('✅ 유동성 추가 트랜잭션 전송 완료')
    } catch (error) {
      console.error('❌ 유동성 추가 실패:', error)
      const details = extractContractError(error)
      console.error('🔍 오류 상세:', details)
      alert('유동성 추가에 실패했습니다. 먼저 토큰을 승인해주세요.')
    }
  }

  // 유동성 제거
  const handleRemoveLiquidity = async () => {
    if (!isConnected || !ammAddress || !removeAmount) return

    try {
      const lpAmount = parseEther(removeAmount)

      if (userLpBalance && lpAmount > userLpBalance) {
        throw new Error(`LP 토큰 잔액 부족: ${formatUnits(userLpBalance, 18)} < ${removeAmount}`)
      }

      console.log('🔄 유동성 제거 시작...')
      console.log('📊 제거 입력 데이터:', {
        ammAddress,
        lpAmount: removeAmount,
        lpAmountWei: lpAmount.toString()
      })

      await removeLiquidity({
        address: ammAddress as `0x${string}`,
        abi: MiniAMM__factory.abi,
        functionName: 'removeLiquidity',
        args: [lpAmount]
      })

      console.log('✅ 유동성 제거 트랜잭션 전송 완료')
    } catch (error) {
      console.error('❌ 유동성 제거 실패:', error)
      const details = extractContractError(error)
      console.error('🔍 제거 오류 상세:', details)
      alert('유동성 제거에 실패했습니다. 콘솔을 확인해주세요.')
    }
  }

  // Swap 방향 변경
  const toggleSwapDirection = () => {
    setSwapDirection(prev => 
      prev === 'token1ToToken2' ? 'token2ToToken1' : 'token1ToToken2'
    )
  }

  // 가격 계산 (간단한 공식)
  const calculatePrice = () => {
    if (!tokenXBalance || !tokenYBalance) return '0'
    
    const xBalance = Number(formatUnits(tokenXBalance, 18))
    const yBalance = Number(formatUnits(tokenYBalance, 18))
    
    if (xBalance === 0 || yBalance === 0) return '0'
    
    return (yBalance / xBalance).toFixed(6)
  }

  const swapPresetValues = ['0.1', '0.5', '1', '5']
  const handlePresetClick = (value: string) => {
    setSwapAmount(value)
  }

  const formattedLpBalance = userLpBalance ? formatUnits(userLpBalance, 18) : '0'
  const hasToken1Reserve = token1Reserve !== undefined
  const hasToken2Reserve = token2Reserve !== undefined
  const formattedToken1Reserve = hasToken1Reserve ? formatUnits(token1Reserve as bigint, 18) : '0'
  const formattedToken2Reserve = hasToken2Reserve ? formatUnits(token2Reserve as bigint, 18) : '0'
  const formattedTokenXBalance = tokenXBalance ? formatUnits(tokenXBalance, 18) : '0'
  const formattedTokenYBalance = tokenYBalance ? formatUnits(tokenYBalance, 18) : '0'
  const formattedTotalSupply = totalSupply ? formatUnits(totalSupply, 18) : '0'

  if (!isConnected) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Swap
          </CardTitle>
          <CardDescription>지갑을 먼저 연결해주세요.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!token1Address || !token2Address) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Swap
          </CardTitle>
          <CardDescription>토큰 주소를 확인해주세요.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Mini AMM 유동성 허브
          </CardTitle>
          <CardDescription>
            {token1Symbol} / {token2Symbol} 풀에서 토큰을 교환하고 유동성을 관리하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3 text-sm">
          <div className="rounded-md border border-border/50 p-3">
            <div className="text-muted-foreground">네트워크</div>
            <div className="mt-1 font-semibold">{chain ? chain.name : '미연결'}</div>
          </div>
          <div className="rounded-md border border-border/50 p-3">
            <div className="text-muted-foreground">보유 LP</div>
            <div className="mt-1 font-semibold">{formattedLpBalance}</div>
          </div>
          <div className="rounded-md border border-border/50 p-3">
            <div className="text-muted-foreground">현재 가격</div>
            <div className="mt-1 font-semibold">
              1 {token1Symbol} ≈ {calculatePrice()} {token2Symbol}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Swap 인터페이스 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              토큰 스왑
            </CardTitle>
            <CardDescription>
              원하는 방향으로 토큰을 교환하고 예상 수량을 확인하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                From: {swapDirection === 'token1ToToken2' ? token1Symbol : token2Symbol}
              </div>
              <Button onClick={toggleSwapDirection} variant="outline" size="sm">
                <ArrowUpDown className="mr-2 h-4 w-4" /> 방향 전환
              </Button>
            </div>
            <input
              type="number"
              placeholder="0.0"
              value={swapAmount}
              onChange={(e) => setSwapAmount(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-muted-foreground">빠른 입력:</span>
              {swapPresetValues.map((value) => (
                <Button
                  key={value}
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => handlePresetClick(value)}
                >
                  {value}
                </Button>
              ))}
            </div>

            <div className="rounded-md border border-border/50 p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">예상 수령량</span>
                <div className="flex items-center gap-2">
                  {isCalculating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>계산 중...</span>
                    </>
                  ) : (
                    <>
                      <span>{calculatedOutput || '0.0'}</span>
                      <span className="text-muted-foreground">
                        {swapDirection === 'token1ToToken2' ? token2Symbol : token1Symbol}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                0.3% 수수료가 포함된 값입니다.
              </div>
            </div>

            <Button
              onClick={handleSwap}
              disabled={isSwapping || isSwapConfirming || !swapAmount}
              className="w-full"
            >
              {isSwapping || isSwapConfirming ? 'Swapping...' : '스왑 실행'}
            </Button>

            {isSwapConfirmed && (
              <Badge variant="secondary" className="w-full justify-center">
                ✅ Swap 완료!
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* 유동성 관리 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              유동성 관리
            </CardTitle>
            <CardDescription>
              풀에 자산을 넣거나 빼서 포지션을 조정하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">유동성 추가 금액</div>
              <input
                type="number"
                placeholder="0.0"
                value={swapAmount}
                onChange={(e) => setSwapAmount(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />

              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  onClick={handleApproveTokens}
                  disabled={isApproving1 || isApproving2 || !swapAmount}
                  variant="outline"
                  className="w-full"
                >
                  {isApproving1 || isApproving2 ? '승인 중...' : '토큰 승인'}
                </Button>
                <Button
                  onClick={handleAddLiquidity}
                  disabled={isAddingLiquidity || isLiquidityConfirming || !swapAmount}
                  className="w-full"
                >
                  {isAddingLiquidity || isLiquidityConfirming ? 'Adding...' : '유동성 추가'}
                </Button>
              </div>

              {isLiquidityConfirmed && (
                <Badge variant="secondary" className="w-full justify-center">
                  ✅ 유동성 추가 완료!
                </Badge>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>유동성 제거</span>
                <span>보유 LP: {formattedLpBalance}</span>
              </div>
              <input
                type="number"
                placeholder="0.0"
                value={removeAmount}
                onChange={(e) => setRemoveAmount(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <Button
                onClick={handleRemoveLiquidity}
                disabled={isRemovingLiquidity || isRemoveConfirming || !removeAmount}
                variant="destructive"
                className="w-full"
              >
                {isRemovingLiquidity || isRemoveConfirming ? 'Removing...' : '유동성 제거'}
              </Button>

              {isRemoveConfirmed && (
                <Badge variant="outline" className="w-full justify-center">
                  ✅ 유동성 제거 완료!
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AMM 정보 */}
      {pairAddress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              AMM 풀 정보
            </CardTitle>
            <CardDescription>현재 풀 상태를 확인하세요.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="rounded-md border border-border/50 p-3">
                <div className="text-muted-foreground">Token X 밸런스</div>
                <div className="mt-1 font-semibold">{formattedTokenXBalance} {token1Symbol}</div>
              </div>
              <div className="rounded-md border border-border/50 p-3">
                <div className="text-muted-foreground">Token Y 밸런스</div>
                <div className="mt-1 font-semibold">{formattedTokenYBalance} {token2Symbol}</div>
              </div>
              <div className="rounded-md border border-border/50 p-3">
                <div className="text-muted-foreground">총 공급량</div>
                <div className="mt-1 font-semibold">{formattedTotalSupply} LP</div>
              </div>
              <div className="rounded-md border border-border/50 p-3">
                <div className="text-muted-foreground">현재 가격</div>
                <div className="mt-1 font-semibold">1 {token1Symbol} = {calculatePrice()} {token2Symbol}</div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-md border border-border/50 p-3">
                <div className="text-muted-foreground">{token1Symbol} 리저브</div>
                <div className="mt-1 font-mono">{hasToken1Reserve ? formattedToken1Reserve : '로딩 중...'}</div>
              </div>
              <div className="rounded-md border border-border/50 p-3">
                <div className="text-muted-foreground">{token2Symbol} 리저브</div>
                <div className="mt-1 font-mono">{hasToken2Reserve ? formattedToken2Reserve : '로딩 중...'}</div>
              </div>
            </div>

            <div className="rounded-md border border-dashed border-border/50 p-3 text-xs text-muted-foreground">
              AMM 주소: <span className="font-mono">{pairAddress}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
