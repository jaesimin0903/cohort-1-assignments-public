'use client'

import { useState, useEffect, useMemo } from 'react'
import { useReadContract } from 'wagmi'
import { MiniAMMFactory__factory } from '../../types/ethers-contracts/factories/MiniAMMFactory__factory'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { RefreshCw, Factory, List, ExternalLink } from 'lucide-react'

interface FactoryInfoProps {
  factoryAddress?: string
}

export function FactoryInfo({ factoryAddress }: FactoryInfoProps) {

  // Factory 주소 (하드코딩된 주소 사용)
  const factoryAddr = factoryAddress || "0x03dBfa79dEd7832b576d101Dd5b2E58fCB88d3E7"

  // allPairsLength 조회
  const { data: pairsLength, refetch: refetchPairsLength } = useReadContract({
    address: factoryAddr as `0x${string}`,
    abi: MiniAMMFactory__factory.abi,
    functionName: 'allPairsLength'
  })

  // allPairs 조회를 위한 useReadContract 훅들 (최대 10개)
  const pair0 = useReadContract({
    address: factoryAddr as `0x${string}`,
    abi: MiniAMMFactory__factory.abi,
    functionName: 'allPairs',
    args: [BigInt(0)],
    query: {
      enabled: !!(pairsLength && pairsLength > BigInt(0))
    }
  })

  const pair1 = useReadContract({
    address: factoryAddr as `0x${string}`,
    abi: MiniAMMFactory__factory.abi,
    functionName: 'allPairs',
    args: [BigInt(1)],
    query: {
      enabled: !!(pairsLength && pairsLength > BigInt(1))
    }
  })

  const pair2 = useReadContract({
    address: factoryAddr as `0x${string}`,
    abi: MiniAMMFactory__factory.abi,
    functionName: 'allPairs',
    args: [BigInt(2)],
    query: {
      enabled: !!(pairsLength && pairsLength > BigInt(2))
    }
  })

  const pair3 = useReadContract({
    address: factoryAddr as `0x${string}`,
    abi: MiniAMMFactory__factory.abi,
    functionName: 'allPairs',
    args: [BigInt(3)],
    query: {
      enabled: !!(pairsLength && pairsLength > BigInt(3))
    }
  })

  const pair4 = useReadContract({
    address: factoryAddr as `0x${string}`,
    abi: MiniAMMFactory__factory.abi,
    functionName: 'allPairs',
    args: [BigInt(4)],
    query: {
      enabled: !!(pairsLength && pairsLength > BigInt(4))
    }
  })

  const pair5 = useReadContract({
    address: factoryAddr as `0x${string}`,
    abi: MiniAMMFactory__factory.abi,
    functionName: 'allPairs',
    args: [BigInt(5)],
    query: {
      enabled: !!(pairsLength && pairsLength > BigInt(5))
    }
  })

  const pair6 = useReadContract({
    address: factoryAddr as `0x${string}`,
    abi: MiniAMMFactory__factory.abi,
    functionName: 'allPairs',
    args: [BigInt(6)],
    query: {
      enabled: !!(pairsLength && pairsLength > BigInt(6))
    }
  })

  const pair7 = useReadContract({
    address: factoryAddr as `0x${string}`,
    abi: MiniAMMFactory__factory.abi,
    functionName: 'allPairs',
    args: [BigInt(7)],
    query: {
      enabled: !!(pairsLength && pairsLength > BigInt(7))
    }
  })

  const pair8 = useReadContract({
    address: factoryAddr as `0x${string}`,
    abi: MiniAMMFactory__factory.abi,
    functionName: 'allPairs',
    args: [BigInt(8)],
    query: {
      enabled: !!(pairsLength && pairsLength > BigInt(8))
    }
  })

  const pair9 = useReadContract({
    address: factoryAddr as `0x${string}`,
    abi: MiniAMMFactory__factory.abi,
    functionName: 'allPairs',
    args: [BigInt(9)],
    query: {
      enabled: !!(pairsLength && pairsLength > BigInt(9))
    }
  })

  // 모든 페어 쿼리들을 배열로 정리
  const allPairQueries = [pair0, pair1, pair2, pair3, pair4, pair5, pair6, pair7, pair8, pair9]

  // 실제 조회된 페어 주소들 추출 (useMemo로 최적화)
  const allPairs = useMemo(() => {
    const pairs: string[] = []
    allPairQueries.forEach((query, index) => {
      if (query.data && query.data !== '0x0000000000000000000000000000000000000000') {
        pairs.push(query.data as string)
      }
    })
    return pairs
  }, [pair0.data, pair1.data, pair2.data, pair3.data, pair4.data, pair5.data, pair6.data, pair7.data, pair8.data, pair9.data])

  // 로딩 상태 계산
  const isLoadingPairs = useMemo(() => {
    return allPairQueries.some(query => query.isLoading)
  }, [pair0.isLoading, pair1.isLoading, pair2.isLoading, pair3.isLoading, pair4.isLoading, pair5.isLoading, pair6.isLoading, pair7.isLoading, pair8.isLoading, pair9.isLoading])

  // 새로고침 버튼 핸들러
  const handleRefresh = () => {
    refetchPairsLength()
    // allPairQueries가 자동으로 업데이트되므로 별도 호출 불필요
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Factory className="h-5 w-5" />
          MiniAMM Factory 정보
        </CardTitle>
        <CardDescription>
          생성된 모든 AMM 페어 목록
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Factory 기본 정보 */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Factory 주소:</span>
            <p className="font-mono text-xs break-all text-muted-foreground">
              {factoryAddr}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">생성된 페어 수:</span>
            <p className="font-medium">
              {pairsLength ? Number(pairsLength) : '0'} 개
            </p>
          </div>
        </div>

        {/* 새로고침 버튼 */}
        <div className="flex justify-end">
          <Button
            onClick={handleRefresh}
            disabled={isLoadingPairs}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingPairs ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
        </div>

        {/* AllPairs 목록 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <List className="h-4 w-4" />
            <span className="text-sm font-medium">AllPairs 목록</span>
          </div>
          
          {isLoadingPairs ? (
            <div className="flex items-center justify-center py-4">
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">페어 목록 로딩 중...</span>
            </div>
          ) : allPairs.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">생성된 페어가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {allPairs.map((pairAddress, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      #{index}
                    </Badge>
                    <span className="font-mono text-sm">
                      {pairAddress}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // 블록 익스플로러에서 확인
                      const explorerUrl = `https://coston2.testnet.flarescan.com/address/${pairAddress}`
                      window.open(explorerUrl, '_blank')
                    }}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 요약 정보 */}
        {allPairs.length > 0 && (
          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">총 페어 수:</span>
                <p className="font-medium">{allPairs.length} 개</p>
              </div>
              <div>
                <span className="text-muted-foreground">상태:</span>
                <Badge variant="default" className="ml-2">
                  활성
                </Badge>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
