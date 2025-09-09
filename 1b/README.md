# Cohort 1 Assignment B - Full Stack Blockchain Infrastructure

이 프로젝트는 완전한 블록체인 인프라를 구축합니다:
- **EVM Node (Geth)**: 로컬 블록체인 네트워크
- **Smart Contract Deployer**: 컨트랙트 자동 배포
- **Blockscout**: 블록체인 익스플로러
- **Graph Protocol**: 데이터 인덱싱 및 GraphQL API
- **Caddy**: 리버스 프록시 (모든 서비스 라우팅)
- **ngrok**: 외부 도메인 터널링

## 🚀 빠른 시작

### 1. 환경 설정
```bash
# .env 파일 생성 (ngrok-setup.md 참조)
cp .env.example .env

# .env 파일에 ngrok 토큰과 도메인 설정
```

### 2. 서비스 시작 (순서대로)

#### 메인 서비스 (Geth, Deployer, Caddy)
```bash
docker-compose up -d
```

#### Blockscout 익스플로러
```bash
docker-compose -f docker-compose.blockscout.yml up -d
```

#### Graph Protocol 스택
```bash
docker-compose -f docker-compose.graph.yml up -d
```

#### ngrok 터널링
```bash
docker-compose -f docker-compose.ngrok.yml up -d
```

## 📋 서비스 엔드포인트

모든 서비스는 ngrok를 통해 외부 도메인으로 접근 가능합니다:

| 서비스 | 경로 | 설명 |
|--------|------|------|
| Smart Contracts | `https://yourdomain.ngrok.io/deployment` | 배포된 컨트랙트 주소 |
| EVM RPC | `https://yourdomain.ngrok.io/rpc` | Geth JSON-RPC API |
| Explorer | `https://yourdomain.ngrok.io/explorer` | Blockscout UI |
| Graph Playground | `https://yourdomain.ngrok.io/graph-playground` | GraphQL 쿼리 인터페이스 |

## 🔍 서비스 확인

### 모든 컨테이너 상태
```bash
docker ps
```

### 각 서비스 로그
```bash
# Geth
docker logs geth

# Caddy
docker logs caddy

# Blockscout
docker logs blockscout-backend

# Graph Node
docker logs graph-node

# ngrok
docker logs ngrok
```

### ngrok 터널 상태
```bash
# 웹 인터페이스: http://localhost:4040
curl http://localhost:4040/api/tunnels
```

## 🧪 테스트

### 1. RPC 연결 테스트
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  http://localhost:8080/rpc
```

### 2. 컨트랙트 배포 확인
```bash
curl http://localhost:8080/deployment
```

### 3. Blockscout 접속
```bash
# 로컬: http://localhost:4000
# 외부: https://yourdomain.ngrok.io/explorer
```

### 4. Graph Playground 접속
```bash
# 로컬: http://localhost:8000
# 외부: https://yourdomain.ngrok.io/graph-playground
```

## 📁 프로젝트 구조

```
1b/
├── docker-compose.yml              # 메인 서비스 (Geth, Caddy, Deployer)
├── docker-compose.blockscout.yml   # Blockscout 익스플로러
├── docker-compose.graph.yml        # Graph Protocol 스택
├── docker-compose.ngrok.yml        # ngrok 터널링
├── caddy/
│   └── Caddyfile                   # Caddy 리버스 프록시 설정
├── geth/
│   └── entrypoint.sh              # Geth 시작 스크립트
├── geth-init/
│   ├── entrypoint.sh              # Geth 초기화 스크립트
│   └── prefund.js                 # 계정 프리펀딩 스크립트
├── sc-deployer/
│   ├── Dockerfile                 # Foundry + Node.js 이미지
│   ├── entrypoint.sh              # 컨트랙트 배포 스크립트
│   └── extract-addresses.js       # 컨트랙트 주소 추출
└── sc-deployment-server/
    └── Caddyfile                  # 컨트랙트 주소 서빙
```

## 🛠️ 문제 해결

### 일반적인 문제들

#### 1. 컨테이너 시작 실패
```bash
# 모든 컨테이너 중지
docker-compose down
docker-compose -f docker-compose.blockscout.yml down
docker-compose -f docker-compose.graph.yml down
docker-compose -f docker-compose.ngrok.yml down

# 다시 시작
docker-compose up --build
```

#### 2. ngrok 연결 문제
```bash
# .env 파일 확인
cat .env

# ngrok 재시작
docker-compose -f docker-compose.ngrok.yml restart
```

#### 3. Blockscout 데이터베이스 문제
```bash
# Blockscout 데이터베이스 리셋
docker-compose -f docker-compose.blockscout.yml down -v
docker-compose -f docker-compose.blockscout.yml up -d
```

## 📊 모니터링

### 서비스 상태 모니터링
```bash
# 모든 서비스 상태
docker stats

# 특정 서비스 로그 실시간
docker logs -f geth
```

### 리소스 사용량 확인
```bash
# Docker 리소스 사용량
docker system df

# 컨테이너별 리소스
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

## 🔧 고급 설정

### 사용자 정의 포트
`docker-compose.yml`에서 포트를 변경할 수 있습니다:
```yaml
services:
  caddy:
    ports:
      - "8080:80"  # 호스트:컨테이너
```

### 환경별 설정
프로덕션 환경에서는 보안 설정을 강화하세요:
- HTTPS 활성화
- 강력한 비밀번호 사용
- 방화벽 설정

---

**🎉 설정이 완료되었습니다!** 모든 서비스가 정상 작동하는지 확인하고 과제를 제출하세요.