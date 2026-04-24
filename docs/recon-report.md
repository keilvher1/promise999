# 선관위 소스 정찰 리포트

정찰 일자: 2026-04-24
정찰자: Claude (자동화된 탐색)

## 1. 소스 요약

| 소스 | URL | robots.txt | 상태 | 핵심 자산 |
|------|-----|-----------|------|----------|
| 정책·공약마당 | `policy.nec.go.kr` | `Allow: /` | ✅ 정상 | 공약/정책 PDF 원문, 내부 JSON API |
| 국가선거정보 개방포털 | `data.nec.go.kr` | `Allow: /` | ✅ 정상 | 공공데이터포털 API 게이트웨이 |
| 선거통계시스템 | `info.nec.go.kr` | **`Disallow: /`** | ⚠️ 크롤링 금지 | 역대 후보 명부, 상세 프로필 (공개 UI만 사용) |
| 예비후보자 공개 | `ecks.nec.go.kr` | — | ❌ ERR_CONNECTION_REFUSED | HTTP/HTTPS 모두 다운. info.nec.go.kr 예비후보자 탭으로 대체 |

## 2. policy.nec.go.kr — 정책·공약마당 (핵심 소스)

### 사이트 구조
- 메인(`/`)은 iframe 래퍼. 실제 콘텐츠는 `/plc/main/initUMAMain.do` 내부.
- 우클릭·드래그 차단 JS 존재(`oncontextmenu="return false" ondragstart="return false"`). 크롤링엔 무관.
- 세션: `jsessionid`가 URL에 박힌 구 Spring 기반. 세션 쿠키로 처리 가능.

### 공개 여부 플래그 (메인 JS에서 실제 확인)
```js
_HBJ_PLC_OPEN_YN = "Y";      // 후보자 공약 공개중
_PARTY_PLC_OPEN_YN = "Y";    // 정당 정책 공개중
_COMMON_PDF_FILE_URL_PATH = "/policy_pdf/";
_COMMON_CDN_URL_PATH = "https://cdn.nec.go.kr";
_COMMON_CANDIDATE_FILE_URL_PATH = "/photo_";
_COMMON_ELECTED_FILE_URL_PATH_LV1 = "/elected_photo/";
```

### 메뉴 구조 (실제 탐색 결과)
**정당정책** `/plc/policy/initUPAPolicy.do?menuId=PARTY{n}`
- PARTY5 → 제21대 대통령선거
- PARTY6 → 제8회 전국동시지방선거 (2022)
- PARTY9 → 제22대 국회의원선거 (2024)
- PARTY1~4,7~8,10~11 → "비정상적 접근"(해당 선거 비공개/미존재)

**당선인공약** `/plc/commiment/initUELCommiment.do?menuId=WINNR{n}`
- WINNR2 → 제21대 대선, WINNR5 → 제8회 지선, WINNR10 → 제22대 총선

**후보자공약** `/plc/commiment/initUCACommiment.do?menuId=CNDDT{n}`
- CNDDT20 → 제22대 국회의원(언급됨), 나머지는 현재 대부분 비노출
- 후보자 등록(2026.5.14) 이후 제9회 지선용 CNDDT 메뉴가 추가될 것으로 추정

**기타**
- 공약이슈트리: `/plc/survey/initUSASurveyPolicyTree.do?menuId=SURVEY{1,9,2}`
- 희망공약제안: `/plc/board/initUBOBoard.do?menuId=BOARD{5}`

### 🔑 내부 JSON API (가장 중요한 발견)
크롤링 난이도를 결정적으로 낮춰주는 내부 AJAX 엔드포인트가 존재합니다. 모두 POST + JSON 응답.

| 엔드포인트 | 파라미터 | 용도 |
|----------|---------|------|
| `/plc/main/initUMAMainTab.do` | `sgId, menuSgId, cnddtYn` | 특정 선거·선거구의 공약/공보 파일 리스트 |
| `/plc/main/initUMAMainMenu.do` | `subSgId` | subSgId → 메뉴 URL 패턴 변환 |
| `/plc/main/initUMAMainMap.do` | `sidoId` | 시도별 하위 지역 목록 |

**실측 응답 예시**
```json
// initUMAMainMap.do sidoId=11 →
{
  "menuinfo": {
    "sgId": "20250603",
    "elecName": "제21대 대통령선거",
    "elecEndYn": "N",
    "sgTypecode": null,
    "wiwid": null, "sggid": null, "jdid": null, "jdname": null,
    "hbjname": null, "hbjgiho": null, "huboid": null,
    "fileTypeName": null, "filePathName": null, "updtFileName": null,
    "pdfCnddtView": null, "pdfElectedView": null, "pdfPartyView": null,
    ...
  }
}
```

**주요 응답 필드 (JSON 키)**: 이 이름들이 그대로 우리 DB 필드에 매핑됨.
- 선거: `sgId`, `elecName`, `sgTypecode`, `sgBireYn`(보궐), `subSgId`
- 지역: `sidoId`, `wiwid`, `wiwparent`, `sggid`, `sggname`, `cvName`, `emdid`, `emdname`
- 정당: `jdid`, `jdname`
- 후보: `huboid`/`huboId`, `hbjname`, `hbjgiho`, `hbjjikup`(직업), `hbjhakruk`(학력), `hbjgihosangse`
- 파일: `fileTypeName`(선거공약서/선거공보/정당정책/5대공약/10대공약), `filePathName`, `updtFileName`, `imgCnt`, `pdfTypeCode`, `fileDispYn`

### 후보자 상세 정보 직링크 (사이트 JS 내 `openCnddtInfo`)
```
http://info.nec.go.kr/electioninfo/candidate_detail_info.xhtml?electionId={sgId}&huboId={huboId}
```
→ info.nec.go.kr의 팝업형 상세 페이지. 통계시스템의 공개 UI 일부가 이 경로로 노출되어 있음.

### PDF 파일 URL 패턴
```
https://cdn.nec.go.kr{filePathName}{updtFileName}
ex) https://cdn.nec.go.kr/policy_pdf/20220601/{xxx}.pdf
```

## 3. data.nec.go.kr — 국가선거정보 개방포털 ★

별도 조사 결과(요약):
- robots.txt `Allow: /` — 크롤링 허용
- 본질은 **공공데이터포털(data.go.kr) API의 선관위 도메인 게이트웨이**
- API 키 발급 필요(활용신청·자동승인 옵션)

### 주요 REST API (data.go.kr 경유)
| 데이터 | 엔드포인트 |
|--------|-----------|
| 선거공약 정보 | `http://apis.data.go.kr/9760000/ElecPrmsInfoInqireService/getCnddtElecPrmsInfoInqire` |
| 투·개표 정보 | `http://apis.data.go.kr/9760000/VoteXmntckInfoInqireService2/getVoteSttusInfoInqire` |
| 후보자 정보 | data.go.kr 데이터셋 `15000908` |
| 당선인 정보 | data.go.kr 데이터셋 `15000864` |
| 투표소 정보 | data.go.kr 데이터셋 `15000836` |
| 선거 코드정보 | data.go.kr 데이터셋 `15000897` |

### 한계
- **공약 API는 메타정보(제출 여부·파일 타입)만 제공** — 원문은 policy.nec.go.kr의 PDF를 따로 받아야 함
- 공약서 제출 의무: 대통령 / 시·도지사 / 시·군·구청장 / 교육감 한정. 국회의원·지방의원은 공보만 활용
- 통상 선거 후 2개월 내 갱신

## 4. info.nec.go.kr — 선거통계시스템

### 크롤링 정책
**`Disallow: /`** → 자동화된 크롤링 금지. 우리 전략:
- 공식 API(data.go.kr) 우선 사용
- 사용자 플로우로 노출되는 팝업 상세(`/electioninfo/candidate_detail_info.xhtml`)는 policy.nec.go.kr JS가 직접 링크하는 공개 URL이므로 **매우 보수적 rate-limit** 하에 개별 후보 링크 1회 조회 수준으로만 활용 검토

### URL 스키마 (관찰)
- 메인: `/main/main_load.xhtml` (최근선거) / `/main/main_previous_load.xhtml` (역대)
- 하위 문서: `/main/showDocument.xhtml?electionId={sgId}&topMenuId={TopId}&secondMenuId={SecondId}`
- 통합검색: `/search/searchCandidate.xhtml` (이름 기반)
- 일괄 다운로드: `/download/electionInfoDownload.xhtml?electionId={sgId or 0000000000}` (역대는 0으로 통합)

### 메뉴 코드 매핑
| topMenuId | 의미 | 주요 secondMenuId |
|-----------|------|------------------|
| BI | 기본현황 | BIES01(선거일정), BIGI06(역대선거 실시상황), BIPP01(정당현황/정책) |
| CD | 선거인수 | CDPI01(인구 추이), CDPB01(선거인수 추이) |
| PC | 예비후보자 | PCRI01(등록수), PCRI03(명부), PCRI04(사퇴/사망/무효), PCRI05(통계) |
| CP | 후보자 | CPRI03(명부), CPRI05(사퇴/사망/무효), CPRI06(통계) |
| EC | 선거운동 | ECEO01(정당사무소), ECPC01(예비후보 운동기구) |
| VC | 투·개표 | VCAP01(사전투표 현황), VCVP01(투표현황), VCCP09(개표현황) |
| EP | 당선인 | EPEI01(당선인명부), EPEI02(무투표당선인), EPEI03(당선인통계) |

### 선거 ID(sgId) 포맷
`{sgTypecode 2자리}{yyyyMMdd}` — 예: `0020260603`(제9회 지선 2026.6.3).
역대 통합: `0000000000`.

### ⚠️ 데이터 주의사항
- **1대~6대 국회의원선거 후보자의 생년월일은 월일이 선거일로 치환된 근사치** (공지 명시). 동일인 매칭 시 제외하거나 `match_confidence`를 낮춰야 함.
- 선거구 경계 재획정 이력: 세종 관련 town 코드 `4148/4149 → 4128` 변환, 제9회 지선 일부 city 코드 `4600 → 2900` 변환 로직이 info.nec.go.kr JS에 박혀 있음 → 우리도 매핑 테이블 유지 필요.

## 5. ecks.nec.go.kr — 예비후보자

- HTTPS/HTTP 모두 `net::ERR_CONNECTION_REFUSED`
- 서비스 이관 또는 일시 중단으로 추정
- 대체: info.nec.go.kr 최근선거 화면의 "예비후보자" 탭(`topMenuId=PC`)

## 6. 크롤링 전략 결론

### 우선순위
1. **공공데이터포털 API** (data.go.kr/9760000/…) — 구조화된 1차 데이터 (후보·투개표·당선인)
2. **policy.nec.go.kr 내부 JSON API + PDF** — 공약/공보 원문 (파일 URL 확보 후 PDF 수집)
3. **info.nec.go.kr는 공개 링크 한정** — 후보 상세 팝업(`candidate_detail_info.xhtml`) 정도만 보수적 접근, robots.txt 존중

### 실행 흐름 (후보 공약 1건 기준)
```
[1] data.go.kr ElecPrmsInfoInqireService
    → 선거별 공약 제출 후보 목록 + fileTypeName
[2] policy.nec.go.kr /plc/main/initUMAMainTab.do (sgId, menuSgId)
    → filePathName, updtFileName 확보
[3] https://cdn.nec.go.kr{filePathName}{updtFileName}
    → PDF 다운로드 → data/pdf 적재
[4] pypdf로 텍스트 추출 → content_raw 저장
[5] Claude API → title/summary/category 부여 (ai_* 필드)
```

### Rate-limit 가이드
- policy.nec.go.kr: 초당 2req 이하 권장 (부하 낮추기), User-Agent 식별 표기
- data.go.kr: API 기본 할당량(예: 1000req/day) 내 운영
- info.nec.go.kr: 핵심 경로 외 접근 금지. 전체 페이지 크롤 금지.

## 7. 후속 확인 필요 사항
- [ ] 공공데이터포털 API 키 발급 (수동)
- [ ] ElecPrmsInfoInqireService 실제 응답 스키마 확인 (API 키 발급 후)
- [ ] `/plc/main/initUMAMainTab.do` 유효 파라미터 조합(실제 선거구·후보) 매핑 테스트
- [ ] 역대 일괄 다운로드(`info.nec.go.kr/download/electionInfoDownload.xhtml`) 파일 포맷 확인 (단건 UI 접근)
