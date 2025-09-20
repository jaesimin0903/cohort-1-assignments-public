'use client'

import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { parseEther, formatUnits } from 'viem'
import { MockERC20__factory } from '../../types/ethers-contracts/factories/MockERC20__factory'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Wallet, Coins, Plus, RefreshCw } from 'lucide-react'

interface TokenDeployerProps {
  token1Address?: string
  token2Address?: string
}

export function TokenDeployer({ token1Address, token2Address }: TokenDeployerProps) {
  const { address, isConnected } = useAccount()
  const token1Name = 'TokenA'
  const token1Symbol = 'TKA'
  const token2Name = 'TokenB'
  const token2Symbol = 'TKB'
  
  // 이미 배포된 토큰 주소들 사용
  const deployedTokens = {
    token1: token1Address || "0xd7eF9887F7284BEDD45A720B38079624f3aEaC4E",
    token2: token2Address || "0xA12aF103579578f9ee66E94B4B6dca8F9fb87886"
  }

  const { writeContract: mintToken1, data: mintHash1, isPending: isMinting1 } = useWriteContract()
  const { writeContract: mintToken2, data: mintHash2, isPending: isMinting2 } = useWriteContract()

  const { isLoading: isMintConfirming1, isSuccess: isMintConfirmed1 } = useWaitForTransactionReceipt({
    hash: mintHash1,
  })

  const { isLoading: isMintConfirming2, isSuccess: isMintConfirmed2 } = useWaitForTransactionReceipt({
    hash: mintHash2,
  })

  // 토큰 정보 조회
  const { data: token1NameData } = useReadContract({
    address: deployedTokens.token1 as `0x${string}`,
    abi: MockERC20__factory.abi,
    functionName: 'name'
  })

  const { data: token1SymbolData } = useReadContract({
    address: deployedTokens.token1 as `0x${string}`,
    abi: MockERC20__factory.abi,
    functionName: 'symbol'
  })

  const { data: token1Decimals } = useReadContract({
    address: deployedTokens.token1 as `0x${string}`,
    abi: MockERC20__factory.abi,
    functionName: 'decimals'
  })

  const { data: token2NameData } = useReadContract({
    address: deployedTokens.token2 as `0x${string}`,
    abi: MockERC20__factory.abi,
    functionName: 'name'
  })

  const { data: token2SymbolData } = useReadContract({
    address: deployedTokens.token2 as `0x${string}`,
    abi: MockERC20__factory.abi,
    functionName: 'symbol'
  })

  const { data: token2Decimals } = useReadContract({
    address: deployedTokens.token2 as `0x${string}`,
    abi: MockERC20__factory.abi,
    functionName: 'decimals'
  })

  // 토큰 밸런스 조회
  const { data: token1Balance, refetch: refetchToken1Balance } = useReadContract({
    address: deployedTokens.token1 as `0x${string}`,
    abi: MockERC20__factory.abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined
  })

  const { data: token2Balance, refetch: refetchToken2Balance } = useReadContract({
    address: deployedTokens.token2 as `0x${string}`,
    abi: MockERC20__factory.abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined
  })

  // 지갑에 토큰 추가
  const addTokenToWallet = async (tokenAddress: string, tokenSymbol: string, tokenDecimals: number, tokenName: string) => {
    type WalletWatchAssetParams = {
      method: 'wallet_watchAsset'
      params: {
        type: 'ERC20'
        options: {
          address: string
          symbol: string
          decimals: number
          image: string
        }
      }
    }

    interface EthereumProvider {
      request: (args: WalletWatchAssetParams) => Promise<unknown>
    }

    const ethereum = (window as typeof window & { ethereum?: EthereumProvider }).ethereum

    if (!ethereum) {
      alert('MetaMask가 설치되어 있지 않습니다.')
      return
    }

    try {
      await ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: tokenAddress,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
            image: `https://via.placeholder.com/32x32/4F46E5/FFFFFF?text=${tokenSymbol.charAt(0)}`
          }
        }
      })
      alert(`${tokenName} (${tokenSymbol})이 지갑에 추가되었습니다!`)
    } catch (error) {
      console.error('토큰 추가 실패:', error)
      alert('토큰 추가에 실패했습니다.')
    }
  }

  // 토큰 민팅 (10000개)
  const handleMintToken1 = async () => {
    if (!isConnected || !deployedTokens.token1) return
    
    try {
      const mintAmount = parseEther('10000')
      await mintToken1({
        address: deployedTokens.token1 as `0x${string}`,
        abi: MockERC20__factory.abi,
        functionName: 'freeMintToSender',
        args: [mintAmount]
      })
    } catch (error) {
      console.error('Token1 민팅 실패:', error)
      alert('Token1 민팅에 실패했습니다.')
    }
  }

  const handleMintToken2 = async () => {
    if (!isConnected || !deployedTokens.token2) return
    
    try {
      const mintAmount = parseEther('10000')
      await mintToken2({
        address: deployedTokens.token2 as `0x${string}`,
        abi: MockERC20__factory.abi,
        functionName: 'freeMintToSender',
        args: [mintAmount]
      })
    } catch (error) {
      console.error('Token2 민팅 실패:', error)
      alert('Token2 민팅에 실패했습니다.')
    }
  }

  // 밸런스 포맷팅 함수
  const formatBalance = (balance: bigint | undefined, decimals: number | undefined) => {
    if (!balance || !decimals) return '0'
    return formatUnits(balance, decimals)
  }

  // 밸런스 새로고침
  const refreshBalances = () => {
    refetchToken1Balance()
    refetchToken2Balance()
  }

  if (!isConnected) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            토큰 관리
          </CardTitle>
          <CardDescription>지갑을 먼저 연결해주세요.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 밸런스 새로고침 버튼 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">토큰 관리</h2>
        <Button onClick={refreshBalances} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          밸런스 새로고침
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Token 1 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Token 1
            </CardTitle>
            <CardDescription>
              {deployedTokens.token1 ? '배포된 토큰' : '새 토큰 배포'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 토큰 정보 및 밸런스 */}
            {deployedTokens.token1 && (
              <div className="space-y-3">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">이름:</span>
                      <p className="font-medium">{token1NameData || '로딩 중...'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">심볼:</span>
                      <p className="font-medium">{token1SymbolData || '로딩 중...'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">소수점:</span>
                      <p className="font-medium">{token1Decimals?.toString() || '로딩 중...'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">밸런스:</span>
                      <p className="font-medium">
                        {formatBalance(token1Balance, token1Decimals)} {token1SymbolData || token1Symbol}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-muted-foreground text-xs">주소:</span>
                    <p className="font-mono text-xs break-all text-muted-foreground">
                      {deployedTokens.token1}
                    </p>
                  </div>
                </div>

                {/* 밸런스 표시 */}
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">내 밸런스</span>
                  </div>
                  <Badge variant="secondary" className="text-lg font-bold">
                    {formatBalance(token1Balance, token1Decimals)} {token1SymbolData || token1Symbol}
                  </Badge>
                </div>
              </div>
            )}

            {/* 액션 버튼들 */}
            <div className="space-y-2">
              <Button
                onClick={() => addTokenToWallet(
                  deployedTokens.token1!,
                  token1SymbolData || token1Symbol,
                  token1Decimals || 18,
                  token1NameData || token1Name
                )}
                variant="outline"
                className="w-full"
              >
                <Wallet className="h-4 w-4 mr-2" />
                지갑에 추가
              </Button>
              
              <Button
                onClick={handleMintToken1}
                disabled={isMinting1 || isMintConfirming1}
                variant="secondary"
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isMinting1 || isMintConfirming1 ? '민팅 중...' : '10,000개 민팅'}
              </Button>
              
              {isMintConfirmed1 && (
                <Badge variant="default" className="w-full justify-center">
                  ✅ 민팅 완료!
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Token 2 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Token 2
            </CardTitle>
            <CardDescription>
              {deployedTokens.token2 ? '배포된 토큰' : '새 토큰 배포'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 토큰 정보 및 밸런스 */}
            {deployedTokens.token2 && (
              <div className="space-y-3">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">이름:</span>
                      <p className="font-medium">{token2NameData || '로딩 중...'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">심볼:</span>
                      <p className="font-medium">{token2SymbolData || '로딩 중...'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">소수점:</span>
                      <p className="font-medium">{token2Decimals?.toString() || '로딩 중...'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">밸런스:</span>
                      <p className="font-medium">
                        {formatBalance(token2Balance, token2Decimals)} {token2SymbolData || token2Symbol}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-muted-foreground text-xs">주소:</span>
                    <p className="font-mono text-xs break-all text-muted-foreground">
                      {deployedTokens.token2}
                    </p>
                  </div>
                </div>

                {/* 밸런스 표시 */}
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium">내 밸런스</span>
                  </div>
                  <Badge variant="secondary" className="text-lg font-bold">
                    {formatBalance(token2Balance, token2Decimals)} {token2SymbolData || token2Symbol}
                  </Badge>
                </div>
              </div>
            )}

            {/* 액션 버튼들 */}
            <div className="space-y-2">
              <Button
                onClick={() => addTokenToWallet(
                  deployedTokens.token2!,
                  token2SymbolData || token2Symbol,
                  token2Decimals || 18,
                  token2NameData || token2Name
                )}
                variant="outline"
                className="w-full"
              >
                <Wallet className="h-4 w-4 mr-2" />
                지갑에 추가
              </Button>
              
              <Button
                onClick={handleMintToken2}
                disabled={isMinting2 || isMintConfirming2}
                variant="secondary"
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isMinting2 || isMintConfirming2 ? '민팅 중...' : '10,000개 민팅'}
              </Button>
              
              {isMintConfirmed2 && (
                <Badge variant="default" className="w-full justify-center">
                  ✅ 민팅 완료!
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
