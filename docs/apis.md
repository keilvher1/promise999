# data.go.kr 선관위 Open API 종합 레퍼런스

공공데이터포털에 제공된 중앙선관위 6개 API의 역할·관계·실측 특이사항.
단일 `일반 인증키`가 모든 API에서 공유됩니다 (활용신청은 API별로 각각 필요).

## 한눈에

| ID | 서비스 | 엔드포인트 prefix | 사용 |
|----|--------|------------------|------|
| 15000897 | **코드정보** | `CommonCodeService` | 선거·지역·정당·직업·학력 마스터 코드 |
| 15000908 | **후보자 정보** | `PofelcddInfoInqireService` | 후보자 프로필 (huboid, 생년월일, 학력, 경력) |
| 15000864 | **당선인 정보** | `WinnerInfoInqireService2` | 당선자 + 득표수(dugsu) + 득표율(dugyul) |
| 15000900 | **투·개표 정보** | `VoteXmntckInfoInqireService2` | 후보자별·지역별 개표결과 |
| 15040587 | **선거공약** | `ElecPrmsInfoInqireService` | 공약 원문 (목표/이행방법/재원조달) |
| 15000836 | **투표소 정보** | `PolplcInfoInqireService2` | 사전투표소·선거일투표소 (2026 "내 투표소 찾기") |

모두 host: `https://apis.data.go.kr/9760000/…`

## 데이터 흐름

```
┌─────────────────┐
│    코드정보      │  선거 목록, 지역(sdName/wiwName), 선거구, 정당
│   (마스터코드)   │  → 나머지 API 파라미터 생성용
└────┬────────────┘
     │
     ▼
┌─────────────────┐     ┌──────────────────┐
│   후보자 정보    │────▶│    선거공약      │
│   (huboid 부여) │     │  (huboid → 공약) │
└────┬────────────┘     └──────────────────┘
     │
     ▼
┌─────────────────┐     ┌──────────────────┐
│   당선인 정보    │────▶│   투·개표 정보    │
│   (당선만, 득표) │     │  (전원 득표, 지역별)│
└─────────────────┘     └──────────────────┘

       ┌──────────────────┐
       │  투표소 정보     │  독립 — 2026 UX 전용
       └──────────────────┘
```

## 공통 포맷

- `sgId`: **8자리 yyyyMMdd** (ex: `20220601` = 제8회 지선)
  - ※ policy.nec.go.kr의 10자리 형식(`0020220601`)과 구별
- `sgTypecode`: 1(대통령), 2(국회의원), 3(시도지사), 4(기초단체장), 5(시도의원), 6(구시군의원), 7(비례국회의원), 8(광역의원비례), 9(기초의원비례), 10(교육의원), 11(교육감)
- 응답 포맷: `resultType=json|xml`. JSON 권장.

## 실측 특이사항 (가이드 PDF와 실제 응답의 차이)

| API | 가이드 표기 | 실제 응답 |
|-----|-------------|----------|
| 선거공약 | `prmsCont{i}` | **`prmmCont{i}`** (오타 그대로 운영) |
| 당선인 | `WinnerInfoInqireService` | **`WinnerInfoInqireService2`** (꼬리 2 필수) |
| 투·개표 | `VoteXmntckInfoInqireService` | **`VoteXmntckInfoInqireService2`** |
| 투표소 | `PolplcInfoInqireService` | **`PolplcInfoInqireService2`** |

→ `data_go_kr.py`에 이미 반영되어 있음.

## 활용신청 이후 전파 지연

승인 직후 **최대 1시간까지 403 Forbidden**이 정상. 이 때 응답 body는 `"Forbidden"` 이라는 plain text (JSON 아님).
전파가 끝나면 `INFO-00 NORMAL SERVICE` 로 바뀝니다.

확인 도구: `crawler/scripts/ping_data_go_kr.py`

## API별 주요 파라미터·필드 요약

### 코드정보 — `CommonCodeService`
6개 오퍼레이션. 가장 범용. **필수 파라미터 적음** (sgId만 있으면 대부분 조회).

| 오퍼레이션 | 파라미터 | 주요 반환 |
|-----------|----------|----------|
| `getCommonSgCodeList` | (없음) | sgId, sgTypecode, sgName, sgVotedate — 역대 전체 선거 |
| `getCommonGusigunCodeList` | sgId, sdName | wiwName — 시도 하위 구·시·군 목록 |
| `getCommonSggCodeList` | sgId, sgTypecode | sggName, sdName, wiwName, sggJungsu(선출정수) |
| `getCommonPartyCodeList` | sgId | jdName — 해당 선거 참여 정당 (무소속 포함) |
| `getCommonJobCodeList` | sgId | jobId, jobName |
| `getCommonEduBckgrdCodeList` | sgId | eduId, eduName |

### 후보자 정보 — `PofelcddInfoInqireService`
- `getPofelcddRegistSttusInfoInqire` — 후보자 (선거 종료 후에도 조회 가능)
- `getPoelpcddRegistSttusInfoInqire` — 예비후보자 (후보자 등록 개시일부터 조회 불가)
- 필수: `sgId, sgTypecode, sggName, sdName`
- 반환 핵심: `huboid`(→ 공약 API에서 `cnddtId`), birthday, gender, addr, jobId/job, eduId/edu, career1/career2, giho, jdName, status(등록/사퇴/사망/등록무효)

### 당선인 정보 — `WinnerInfoInqireService2`
- `getWinnerInfoInqire` — **당선자만** 제공
- 필수: `sgId, sgTypecode, sggName, sdName`
- 반환 핵심: huboid, jdName, name, giho, **dugsu(득표수)**, **dugyul(득표율 %)**

### 투·개표 정보 — `VoteXmntckInfoInqireService2`
- `getVoteSttusInfoInqire` — 투표결과 (선거인수, 투표자수, 투표율)
- `getXmntckSttusInfoInqire` — **개표결과** (후보별 득표)
- 필수: `sgId, sgTypecode, sdName, wiwName` (개표결과는 `sggName`도)
- 반환 특이: **후보자별 득표가 평탄화 필드** — `hbj01..hbj50` + `jd01..jd50` + `dugsu01..dugsu50` (최대 50명)
- **응답에 huboid 없음** → (name, jdName) 쌍으로 매칭 필요
- 광역선거 전체 득표는 구·시·군 단위 반복 호출 → 서버에서 합산

### 선거공약 — `ElecPrmsInfoInqireService`
- `getCnddtElecPrmsInfoInqire` — 후보자 한 명의 공약
- 필수: `sgId, sgTypecode, cnddtId`
- **공약서 제출 의무 선거만 지원**: sgTypecode ∈ {1, 3, 4, 11}
  - 국회의원(2)은 "선거공보"만 제출 → 이 API에서 공약 없음
- **선거 종료 후**: 낙선자 공약은 제거되고 당선자만 남음
- 반환: prmsCnt + `prmsOrd{i}`, `prmsRealmName{i}`(공약분야), `prmsTitle{i}`, **`prmmCont{i}`**(공약내용, 원문 상세)
  - 내용은 `□ 목표 / □ 이행방법 / □ 이행기간 / □ 재원조달방안` 구조

### 투표소 정보 — `PolplcInfoInqireService2`
- `getPrePolplcOtlnmapTrnsportInfoInqire` — 사전투표소 (evPsName, evOrder)
- `getPolplcOtlnmapTrnsportInfoInqire` — 선거일투표소 (psName)
- 필수: `sgId, sdName, wiwName`
- 반환: 투표소명, placeName(건물), addr, floor, emdName(읍면동)

## 에러 코드

| 코드 | 의미 |
|------|------|
| `INFO-00` | 정상 |
| `INFO-03` | 데이터 없음 (파라미터 유효, 결과만 비어있음) |
| `ERROR-310` | 해당 서비스 없음 (엔드포인트 오타) |
| `ERROR-340` | 필수 파라미터 누락 |
| `SERVICE_KEY_IS_NOT_REGISTERED_ERROR` | 키 미등록 |
| `UNREGISTERED_IP_ERROR` | IP 미등록 |
| `LIMITED_NUMBER_OF_SERVICE_REQUESTS_EXCEEDS_ERROR` | 호출 한도 초과 |

403 + body가 plain "Forbidden"인 경우는 **활용신청 직후 전파 대기**일 가능성이 높음 (위 에러 코드들과 다름).

## 모든 API를 교차로 활용하는 예시 (서울시장 2022)

```
1. 코드정보 getCommonGusigunCodeList(sgId=20220601, sdName=서울특별시)
   → 25개 자치구 목록

2. 후보자 getPofelcddRegistSttusInfoInqire(sgId=20220601, sgTypecode=3, sdName/sggName=서울특별시)
   → 5명 후보 + huboid (100147796 송영길, 100149260 오세훈, …)

3. 선거공약 getCnddtElecPrmsInfoInqire(cnddtId=100149260)
   → 오세훈 5대 공약 원문

4. 당선인 getWinnerInfoInqire(sgId, sgTypecode, sdName/sggName=서울특별시)
   → 오세훈만 반환, dugsu=2608277, dugyul=59.05

5. 투·개표 getXmntckSttusInfoInqire(sgId, sgTypecode, sdName=서울특별시, sggName=서울특별시, wiwName=<자치구>)
   × 25개 자치구 반복 → (name, jdName) 기준 합산
   → 5명 전원 득표 (오세훈 2,608,277 / 송영길 1,733,183 / 권수정 53,840 / …)
```

이 플로우가 `crawler/scripts/crawl_seoul_mayor_2022.py` + `update_winners_2022.py` + `update_votes_seoul_mayor_2022.py`에 구현되어 있습니다.
