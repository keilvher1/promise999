# ai

Claude API 기반 후처리 (용어 풀이·분류·이력비교).

## 허용 범위 (원칙)
- ✅ **용어 풀이** — 어려운 행정·정책 용어를 중립적 사전 정의로
- ✅ **공약 분야 자동 분류** — 경제/복지/교육/환경/안전/문화/교통/...
- ✅ **동일 후보 과거 공약 대비 변화 지점 추출** — "2022년 X 주장 → 2026년 Y 주장"을 요약
- ✅ **PDF 텍스트 → 항목 단위 파싱** — 구조화 보조

## 금지 (선거법·편향 리스크)
- ❌ 공약의 효과·타당성 평가
- ❌ 후보 간 우열 판단
- ❌ 실현 가능성 예측
- ❌ 정파적 맥락 해석

## 구조
```
ai/
  prompts/
    term_definition.md      # 용어 풀이 프롬프트
    category_classify.md    # 분야 분류 프롬프트
    diff_summary.md         # 공약 변화 요약 프롬프트
    item_extraction.md      # PDF → 공약 항목 분해 프롬프트
  scripts/
    batch_terms.py          # terms 테이블 채우기
    batch_categorize.py     # pledge_items.ai_category 채우기
    batch_diff.py           # pledge_comparisons 채우기
```

## 실행
```bash
export ANTHROPIC_API_KEY=...
python scripts/batch_categorize.py --since 2022-01-01
```

AI 생성물은 항상 `ai_*` 프리픽스 필드에만 저장. 원문 필드는 수정 금지.
