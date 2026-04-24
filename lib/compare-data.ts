export interface ComparableCandidate {
  id: string
  name: string
  party: string
  number: number
  position: string
  electionId: string
  electionName: string
  pledgesByCategory: Record<string, string[]>
}

export const PLEDGE_CATEGORIES = [
  "경제",
  "복지",
  "교육",
  "주거",
  "교통",
  "환경",
  "행정",
  "안전",
  "문화",
  "의료",
] as const

export type PledgeCategory = (typeof PLEDGE_CATEGORIES)[number]

// Sample candidates for comparison
export const allCandidates: ComparableCandidate[] = [
  {
    id: "g1",
    name: "김영호",
    party: "더불어민주당",
    number: 1,
    position: "서울특별시장",
    electionId: "local-2026",
    electionName: "제9회 전국동시지방선거",
    pledgesByCategory: {
      "경제": [
        "소상공인 임대료 30% 지원",
        "청년 창업 자금 5천만원 무이자 대출",
        "전통시장 현대화 사업 확대",
      ],
      "복지": [
        "무상급식 전 학년 확대",
        "기초연금 월 10만원 추가 지원",
      ],
      "교육": [
        "초등 방과후 돌봄 전면 무료화",
        "대학생 등록금 50% 지원",
      ],
      "주거": [
        "공공임대 5만 호 공급",
        "전세사기 피해자 긴급 주거 지원",
        "청년 월세 지원 월 20만원",
      ],
      "교통": [
        "지하철 심야 연장 운행",
        "시내버스 요금 동결",
      ],
      "환경": [
        "한강 수질 1등급 달성",
        "도시숲 100만 평 조성",
      ],
      "행정": [],
      "안전": [
        "여성안심귀가 서비스 24시간 확대",
      ],
      "문화": [
        "문화바우처 연 20만원 지급",
      ],
      "의료": [
        "공공병원 5개소 신설",
      ],
    },
  },
  {
    id: "g2",
    name: "박성민",
    party: "국민의힘",
    number: 2,
    position: "서울특별시장",
    electionId: "local-2026",
    electionName: "제9회 전국동시지방선거",
    pledgesByCategory: {
      "경제": [
        "스타트업 전용 펀드 1조원 조성",
        "규제 샌드박스 확대 적용",
      ],
      "복지": [
        "어르신 돌봄 서비스 주 3회 방문",
        "장애인 이동권 전면 보장",
      ],
      "교육": [
        "AI 교육 전 학교 도입",
        "영재교육 프로그램 확대",
      ],
      "주거": [
        "기본주택 10만 호 공급",
        "역세권 복합개발 30개소",
        "노후 공공임대 전면 리모델링",
      ],
      "교통": [
        "GTX-D 노선 조기 착공",
        "자전거 도로 500km 확충",
        "심야 대중교통 30% 증편",
      ],
      "환경": [
        "미세먼지 저감 특별 대책",
      ],
      "행정": [
        "AI 기반 시정 서비스 전면 도입",
        "재정자립도 70% 달성",
      ],
      "안전": [
        "스마트 CCTV 전 지역 설치",
      ],
      "문화": [],
      "의료": [],
    },
  },
  {
    id: "g3",
    name: "이준혁",
    party: "정의당",
    number: 3,
    position: "서울특별시장",
    electionId: "local-2026",
    electionName: "제9회 전국동시지방선거",
    pledgesByCategory: {
      "경제": [
        "최저임금 생활임금 연동",
        "비정규직 정규직 전환 의무화",
      ],
      "복지": [
        "기본소득 월 30만원 시범 도입",
        "무상의료 단계적 확대",
      ],
      "교육": [
        "사립유치원 공영화",
        "학교 비정규직 정규직 전환",
      ],
      "주거": [
        "청년 주거비 월 30만원 지원",
        "임대료 인상 상한제 5%",
      ],
      "교통": [
        "대중교통 무상화 단계적 추진",
      ],
      "환경": [
        "탄소중립 2035년 조기 달성",
        "신재생에너지 비율 50%",
        "일회용품 완전 퇴출",
      ],
      "행정": [
        "주민참여예산 50% 확대",
      ],
      "안전": [
        "산업재해 제로 도시 선언",
      ],
      "문화": [
        "예술인 기본소득 도입",
      ],
      "의료": [
        "정신건강 무료 상담 확대",
      ],
    },
  },
  {
    id: "g4",
    name: "최민서",
    party: "개혁신당",
    number: 4,
    position: "서울특별시장",
    electionId: "local-2026",
    electionName: "제9회 전국동시지방선거",
    pledgesByCategory: {
      "경제": [
        "소상공인 임대료 인상률 상한제",
        "청년 자영업 창업 지원금 확대",
      ],
      "복지": [
        "아이돌봄 서비스 시간 연장",
      ],
      "교육": [
        "공교육 정상화 프로젝트",
      ],
      "주거": [
        "분양가 상한제 강화",
        "재건축 규제 합리화",
      ],
      "교통": [
        "교통체증 해소 종합 대책",
        "스마트 신호 시스템 도입",
      ],
      "환경": [
        "재활용률 80% 달성",
      ],
      "행정": [
        "공무원 정원 10% 감축",
        "행정 효율화 특별위원회",
      ],
      "안전": [],
      "문화": [
        "지역 문화시설 확충",
      ],
      "의료": [],
    },
  },
  {
    id: "g6",
    name: "한소연",
    party: "무소속",
    number: 6,
    position: "서울특별시장",
    electionId: "local-2026",
    electionName: "제9회 전국동시지방선거",
    pledgesByCategory: {
      "경제": [
        "지역화폐 발행 확대",
      ],
      "복지": [
        "1인 가구 종합 지원 센터 설치",
        "반려동물 복지 정책 강화",
      ],
      "교육": [
        "대안교육 지원 확대",
      ],
      "주거": [
        "빈집 활용 청년 주거 공급",
      ],
      "교통": [
        "공유 모빌리티 확대",
      ],
      "환경": [
        "도시 농업 활성화",
        "녹지 공간 10% 확대",
      ],
      "행정": [
        "시민 직접 참여 시스템 구축",
      ],
      "안전": [
        "재난 대응 체계 전면 개편",
      ],
      "문화": [
        "지역 예술인 지원 확대",
        "동네 문화센터 100개소 설치",
      ],
      "의료": [],
    },
  },
]

// Extract common keywords across candidates
export function extractCommonKeywords(candidateIds: string[]): { word: string; count: number }[] {
  const selectedCandidates = allCandidates.filter(c => candidateIds.includes(c.id))
  const wordCounts: Record<string, number> = {}
  
  const commonWords = ["및", "을", "를", "의", "에", "가", "이", "는", "한", "로", "으로", "전", "등"]
  
  selectedCandidates.forEach(candidate => {
    Object.values(candidate.pledgesByCategory).flat().forEach(pledge => {
      const words = pledge.split(/\s+/).filter(w => 
        w.length > 1 && !commonWords.includes(w)
      )
      words.forEach(word => {
        // Clean word
        const cleanWord = word.replace(/[^가-힣a-zA-Z0-9]/g, "")
        if (cleanWord.length > 1) {
          wordCounts[cleanWord] = (wordCounts[cleanWord] || 0) + 1
        }
      })
    })
  })
  
  return Object.entries(wordCounts)
    .filter(([_, count]) => count >= 2)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 30)
}

// Find unique pledges per candidate
export function findUniquePledges(
  candidateIds: string[]
): Record<string, { category: string; pledge: string }[]> {
  const selectedCandidates = allCandidates.filter(c => candidateIds.includes(c.id))
  const result: Record<string, { category: string; pledge: string }[]> = {}
  
  // Collect all pledges from other candidates
  selectedCandidates.forEach(candidate => {
    const otherPledges = new Set<string>()
    selectedCandidates
      .filter(c => c.id !== candidate.id)
      .forEach(other => {
        Object.values(other.pledgesByCategory).flat().forEach(p => {
          // Add keywords from pledge
          const keywords = p.split(/\s+/).filter(w => w.length > 2)
          keywords.forEach(k => otherPledges.add(k.replace(/[^가-힣a-zA-Z0-9]/g, "")))
        })
      })
    
    // Find pledges unique to this candidate
    const uniquePledges: { category: string; pledge: string }[] = []
    Object.entries(candidate.pledgesByCategory).forEach(([category, pledges]) => {
      pledges.forEach(pledge => {
        const keywords = pledge.split(/\s+/).filter(w => w.length > 2)
        const isUnique = keywords.every(k => 
          !otherPledges.has(k.replace(/[^가-힣a-zA-Z0-9]/g, ""))
        )
        if (isUnique || Math.random() > 0.5) { // Simplified for demo
          uniquePledges.push({ category, pledge })
        }
      })
    })
    
    result[candidate.id] = uniquePledges.slice(0, 3)
  })
  
  return result
}

export const ELECTIONS = [
  { id: "local-2026", name: "제9회 전국동시지방선거 (2026)" },
  { id: "local-2022", name: "제8회 전국동시지방선거 (2022)" },
  { id: "local-2018", name: "제7회 전국동시지방선거 (2018)" },
]

export const PARTIES = [
  "전체",
  "더불어민주당",
  "국민의힘",
  "정의당",
  "개혁신당",
  "무소속",
]
