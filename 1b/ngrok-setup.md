# ngrok 설정 가이드

## 1. ngrok 계정 생성 및 설정

### 1.1 ngrok 가입
1. [ngrok.com](https://ngrok.com)에 가입하세요
2. 대시보드에서 Auth Token을 복사하세요: https://dashboard.ngrok.com/get-started/your-authtoken

### 1.2 커스텀 도메인 설정
1. [ngrok Domains](https://dashboard.ngrok.com/domains) 페이지로 이동
2. 커스텀 도메인을 구매하거나 설정하세요
3. 도메인을 기록해두세요

## 2. 환경변수 설정

### 2.1 .env 파일 생성
```bash
cp .env.example .env
```

### 2.2 .env 파일 편집
```env
# ngrok Configuration
NGROK_AUTHTOKEN=your-actual-ngrok-auth-token
NGROK_DOMAIN=your-actual-custom-domain.ngrok.io
```

## 3. 서비스 시작 순서

### 3.1 메인 서비스 시작 (포트 8080)
```bash
docker-compose up -d
```

### 3.2 Blockscout 시작 (포트 4000)
```bash
docker-compose -f docker-compose.blockscout.yml up -d
```

### 3.3 Graph 스택 시작 (포트 8000)
```bash
docker-compose -f docker-compose.graph.yml up -d
```

### 3.4 ngrok 터널링 시작
```bash
docker-compose -f docker-compose.ngrok.yml up -d
```

## 4. 최종 엔드포인트 확인

모든 서비스가 시작되면 다음 URL로 접근할 수 있습니다:

- **Smart Contracts Deployment**: `https://your-domain.ngrok.io/deployment`
- **EVM Node RPC**: `https://your-domain.ngrok.io/rpc`
- **Blockscout Explorer**: `https://your-domain.ngrok.io/explorer`
- **Graph Playground**: `https://your-domain.ngrok.io/graph-playground`

## 5. 문제 해결

### ngrok 연결 확인
```bash
docker logs ngrok
```

### 서비스 상태 확인
```bash
docker ps
```

### ngrok 웹 인터페이스
- http://localhost:4040 (ngrok 상태 확인)



