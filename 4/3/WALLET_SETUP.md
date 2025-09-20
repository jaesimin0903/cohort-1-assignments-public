# MiniAMM DApp - 지갑 연결 설정

## Reown AppKit 설정

### 1. 프로젝트 ID 설정

1. [Reown Cloud](https://cloud.reown.com)에 접속하여 계정을 생성하거나 로그인합니다
2. 새 프로젝트를 생성합니다
3. 프로젝트 ID를 복사합니다
4. 프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가합니다:

```env
NEXT_PUBLIC_PROJECT_ID=your_project_id_here
```

### 2. 개발 서버 실행

```bash
npm run dev
```

### 3. 기능

- **지갑 연결**: MetaMask, WalletConnect 등 다양한 지갑 지원
- **네트워크 지원**: Ethereum Mainnet, Arbitrum, Polygon, Sepolia
- **잔액 표시**: 연결된 지갑의 ETH 잔액 표시
- **네트워크 정보**: 현재 연결된 네트워크 정보 표시
- **소셜 로그인**: Google, X(Twitter), GitHub, Discord 등 지원

### 4. 사용법

1. 웹사이트에 접속합니다
2. "지갑 연결" 버튼을 클릭합니다
3. 원하는 지갑을 선택하여 연결합니다
4. 연결 후 지갑 주소, 네트워크, 잔액 정보를 확인할 수 있습니다

### 5. 문제 해결

- 지갑이 연결되지 않는 경우: 브라우저에서 지갑 확장 프로그램이 설치되어 있는지 확인하세요
- 네트워크 오류가 발생하는 경우: 올바른 네트워크에 연결되어 있는지 확인하세요
- 프로젝트 ID 오류: `.env.local` 파일의 `NEXT_PUBLIC_PROJECT_ID`가 올바르게 설정되어 있는지 확인하세요
