'use client'

import Image from "next/image";
import { WalletConnectButton } from "./components/WalletConnectButton";
import { TokenDeployer } from "./components/TokenDeployer";
import { AMMFactoryDeployer } from "./components/AMMFactoryDeployer";
import { SwapInterface } from "./components/SwapInterface";
import { FactoryInfo } from "./components/FactoryInfo";

export default function Home() {
  // 이미 배포된 토큰 주소들
  const deployedTokens = {
    token1: "0xd7eF9887F7284BEDD45A720B38079624f3aEaC4E",
    token2: "0xA12aF103579578f9ee66E94B4B6dca8F9fb87886"
  }
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <div className="text-center sm:text-left">
          <h1 className="text-4xl font-bold mb-4">MiniAMM DApp</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            지갑을 연결하고 AMM(자동화된 마켓 메이커) 거래를 시작하세요
          </p>
          <ol className="font-mono list-inside list-decimal text-sm/6 text-center sm:text-left">
            <li className="mb-2 tracking-[-.01em]">
              지갑 연결 버튼을 클릭하여 지갑을 연결하세요
            </li>
            <li className="tracking-[-.01em]">
              연결된 지갑의 잔액과 네트워크 정보를 확인하세요
            </li>
          </ol>
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          {/* Use WalletConnectButton component */}
          <WalletConnectButton />
        </div>

        {/* Token Deployer Section */}
        <div className="w-full max-w-4xl">
          <TokenDeployer 
            token1Address={deployedTokens.token1}
            token2Address={deployedTokens.token2}
          />
        </div>

            {/* AMM Factory Deployer Section */}
            <div className="w-full max-w-4xl">
              <AMMFactoryDeployer
                token1Address={deployedTokens.token1}
                token2Address={deployedTokens.token2}
              />
            </div>

            {/* Swap Interface Section */}
            <div className="w-full max-w-4xl">
              <SwapInterface
                token1Address={deployedTokens.token1}
                token2Address={deployedTokens.token2}
              />
            </div>

            {/* Factory Info Section */}
            <div className="w-full max-w-4xl">
              <FactoryInfo />
            </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
