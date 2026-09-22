# JUMI Finance Lab

`domain-rag-lab`의 금융상품·자산배분 RAG 학습 구조와 `investment-analysis`의 시장·기업·포트폴리오·백테스트 기능을 하나로 통합한 금융지식 학습 웹앱입니다.

## 과제 요구사항 반영

| 요구사항 | 구현 내용 |
|---|---|
| 두 사이트 통합 | `investment-analysis`를 실행 기반으로 사용하고 `domain-rag-lab`의 금융상품·자산배분·리스크 학습 흐름을 통합 |
| 3주 학습의 10단원 재구성 | 금융시장부터 리스크관리·백테스트까지 10개 단원으로 재구성 |
| RAG 인덱싱 | `docs/unit-01.md`~`unit-10.md`를 청킹해 Qdrant에 색인하고 검색 근거와 출처 표시 |
| GNB/LNB 재배치 | GNB는 홈·10단원·분석도구·RAG·백테스트, LNB는 세부 단원과 기능으로 구성 |
| AWS EC2 배포 | `docker-compose.prod.yml`로 FastAPI·MongoDB·Qdrant·Meilisearch를 실행하고 80번 포트 공개 |

## 10단원

1. 금융시장과 금융상품
2. 주식·ETF와 시장
3. 채권·금리·신용위험
4. 파생상품과 헤지
5. 재무제표와 현금흐름
6. 기업가치평가
7. 거시경제와 시장지표
8. 산업·기업·기술적 분석
9. 포트폴리오와 자산배분
10. 리스크관리·백테스트·RAG 통합 실습

## 주요 기능

- Markdown 기반 10단원 학습 및 학습 진행률 저장
- Qdrant 벡터 검색과 근거 문서를 표시하는 RAG 질의
- Meilisearch 기반 전체 학습문서 검색
- 시장·기업·재무제표·가치평가·기술적 분석 도구
- 포트폴리오 구성·최적화·리스크 분석
- QuantConnect LEAN 전략 코드와 백테스트 메뉴
- FastAPI API 문서: `/docs`

## AWS EC2 배포

Ubuntu EC2 보안그룹에서 `22/tcp`, `80/tcp`를 허용한 뒤 실행합니다.

```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-v2 git
sudo usermod -aG docker "$USER"
newgrp docker

git clone https://github.com/JM973279/git-test1.git jumi-finance-rag
cd jumi-finance-rag
printf 'MEILI_MASTER_KEY=%s\n' "$(openssl rand -hex 24)" > .env

docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml --profile tools run --rm docs-index
docker compose -f docker-compose.prod.yml --profile tools run --rm search-index
curl --fail http://localhost/api/health
```

브라우저에서 `http://<EC2-퍼블릭-IP>`로 접속합니다.

## 로컬 실행

Docker가 설치된 환경에서 다음과 같이 실행합니다.

```bash
APP_PORT=8080 docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml --profile tools run --rm docs-index
docker compose -f docker-compose.prod.yml --profile tools run --rm search-index
```

접속 주소는 `http://localhost:8080`입니다.

## 프로젝트 구조

```text
app/backend/       FastAPI API와 RAG 검색
app/frontend/      SPA 화면, GNB/LNB, 학습·분석 도구
docs/              RAG 색인 대상 10개 학습 단원
scripts/           Qdrant·Meilisearch 색인 및 메뉴 동기화
lean-*/            삼성전자·삼성전기·현대차 LEAN 전략
docker-compose.prod.yml
```

백테스트 결과, DB 내보내기, 개인 데이터, `.env`, API 키 및 PEM 파일은 공개 저장소에 포함하지 않습니다. 백테스트 결과 폴더는 실행 시 생성됩니다.
