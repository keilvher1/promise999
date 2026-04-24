"""공공데이터포털 6개 선관위 API 전파 상태 통합 확인.

승인 직후 최대 1시간까지 403이 날 수 있습니다. 이 스크립트를 주기적으로 돌려
모두 ✅ 뜨면 전체 크롤 스크립트 실행 시점.

사용:
    python3 crawler/scripts/ping_data_go_kr.py
"""
from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
import requests
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))

KEY = os.environ["DATA_GO_KR_API_KEY_DECODED"]
BASE = "https://apis.data.go.kr/9760000"
UA = {"User-Agent": "Mozilla/5.0 (promise999 ping)"}

CHECKS = [
    ("선거공약     (15040587)", "ElecPrmsInfoInqireService/getCnddtElecPrmsInfoInqire",
     {"pageNo":1,"numOfRows":1,"sgId":"20220309","sgTypecode":1,"cnddtId":"100000000"}),
    ("후보자 정보   (15000908)", "PofelcddInfoInqireService/getPofelcddRegistSttusInfoInqire",
     {"pageNo":1,"numOfRows":1,"sgId":"20220309","sgTypecode":1,"sdName":"전국","sggName":"대한민국"}),
    ("당선인 정보   (15000864)", "WinnerInfoInqireService2/getWinnerInfoInqire",
     {"pageNo":1,"numOfRows":1,"sgId":"20220601","sgTypecode":3,"sdName":"서울특별시","sggName":"서울특별시"}),
    ("투·개표 정보  (15000900)", "VoteXmntckInfoInqireService2/getXmntckSttusInfoInqire",
     {"pageNo":1,"numOfRows":1,"sgId":"20220601","sgTypecode":3,"sdName":"서울특별시","sggName":"서울특별시","wiwName":"종로구"}),
    ("코드정보     (15000897)", "CommonCodeService/getCommonSgCodeList",
     {"pageNo":1,"numOfRows":1}),
    ("투표소 정보   (15000836)", "PolplcInfoInqireService2/getPolplcOtlnmapTrnsportInfoInqire",
     {"pageNo":1,"numOfRows":1,"sgId":"20220601","sdName":"서울특별시","wiwName":"종로구"}),
]

def check(path, params):
    q = {"serviceKey": KEY, "resultType": "json", **params}
    try:
        r = requests.get(f"{BASE}/{path}", params=q, headers=UA, timeout=15)
    except Exception as e:
        return "🌐", f"network error: {e}"
    if r.status_code == 403:
        return "⏳", "403 — 전파 대기"
    if r.status_code != 200:
        return "❌", f"HTTP {r.status_code}"
    t = r.text
    if "NORMAL SERVICE" in t:
        return "✅", "정상"
    if "INFO-00" in t:
        return "✅", "정상"
    if "INFO-03" in t:
        return "✅", "정상 (샘플 데이터 없음)"
    if "SERVICE_KEY_IS_NOT_REGISTERED" in t:
        return "🔑", "키 미등록"
    if "UNREGISTERED_IP" in t:
        return "🌐", "IP 미등록"
    return "❓", t[:80].replace("\n", " ")

print("=" * 72)
print("  공공데이터포털 (선관위) 6개 API 상태")
print("=" * 72)
ok = 0
for label, path, params in CHECKS:
    icon, msg = check(path, params)
    if icon == "✅":
        ok += 1
    print(f"  {icon}  {label}  {msg}")
print("=" * 72)
print(f"  {ok}/{len(CHECKS)} 정상")
