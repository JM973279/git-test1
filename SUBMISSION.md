# 과제 제출 체크리스트

## 제출 전 확인

- [ ] 메인 화면에서 `JUMI Finance Lab` 브랜드와 GNB가 보인다.
- [ ] 좌측 `10단원 통합학습`에서 1~10단원이 모두 열린다.
- [ ] `RAG` 메뉴에서 질문 후 검색 원문과 출처가 표시된다.
- [ ] `분석도구`, `포트폴리오`, `LEAN 백테스트` 메뉴가 열린다.
- [ ] `http://<EC2 퍼블릭 IP>/api/health`가 정상 응답한다.
- [ ] GitHub 저장소에 `.env`, API 키, PEM 파일이 올라가지 않았다.

## EC2에서 최종 확인 명령

```bash
cd /opt/jumi-finance-rag
docker compose -f docker-compose.prod.yml ps
curl --fail http://localhost/api/health
curl --fail http://localhost/api/rag/status
```

학습문서를 수정했다면 색인을 다시 만듭니다.

```bash
docker compose -f docker-compose.prod.yml --profile tools run --rm docs-index
docker compose -f docker-compose.prod.yml --profile tools run --rm search-index
```

## 디스코드 제출 형식

```text
김주미 - <EC2 퍼블릭 IP> - https://github.com/JM973279/git-test1
```

예시:

```text
김주미 - 1.2.3.4 - https://github.com/JM973279/git-test1
```
