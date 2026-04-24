export type CandidateStatus = "running" | "elected" | "defeated" | "withdrew"

export interface Pledge {
  id: string
  order: number
  title: string
  summary: string
  category: string
  fullText?: string
}

export interface CandidacyHistory {
  id: string
  year: number
  electionName: string
  party: string
  district: string
  result: "elected" | "defeated" | "withdrew"
  pledges?: Pledge[]
}

export interface PledgeChange {
  continued: string[]
  changed: { before: string; after: string }[]
  dropped: string[]
  added: string[]
}

export interface CandidateDetail {
  id: string
  name: string
  photo?: string
  electionName: string
  position: string
  number: number
  party: string
  status: CandidateStatus
  withdrawDate?: string
  birthDate: string
  education: string
  occupation: string
  pdfUrl?: string
  necUrl?: string
  keyPledges: Pledge[]
  detailedPledges: Record<string, Pledge[]>
  history: CandidacyHistory[]
  pledgeChanges: Record<string, PledgeChange>
}

// Sample data
export const sampleCandidate: CandidateDetail = {
  id: "g2",
  name: "박성민",
  electionName: "제9회 전국동시지방선거",
  position: "서울특별시장",
  number: 2,
  party: "국민의힘",
  status: "running",
  birthDate: "1968년 3월 15일",
  education: "서울대학교 행정학 학사, 미국 하버드대학교 행정대학원 석사",
  occupation: "전 국회의원 (4선)",
  pdfUrl: "/pledges/park-seongmin-2026.pdf",
  necUrl: "https://policy.nec.go.kr",
  keyPledges: [
    {
      id: "kp1",
      order: 1,
      title: "서울형 기본주택 10만 호 공급",
      summary: "2030년까지 시세의 50% 수준으로 장기 임대가 가능한 기본주택 10만 호를 서울 전역에 공급하여 청년 및 신혼부부의 주거 안정을 도모함.",
      category: "주거",
    },
    {
      id: "kp2",
      order: 2,
      title: "GTX-D 노선 조기 착공",
      summary: "GTX-D 노선 예비타당성 조사를 조기 완료하고, 2027년 내 착공을 추진하여 서울 서남권 교통난 해소에 기여함.",
      category: "교통",
    },
    {
      id: "kp3",
      order: 3,
      title: "AI 기반 시정 서비스 전면 도입",
      summary: "행정 민원 처리, 교통 신호 제어, 재난 예측 등 전 분야에 AI 기술을 적용하여 스마트 시정 구현을 목표로 함.",
      category: "행정",
    },
    {
      id: "kp4",
      order: 4,
      title: "서울시 재정자립도 70% 달성",
      summary: "비효율 예산 구조 개선 및 신규 세원 발굴을 통해 재정자립도를 현 65%에서 70%로 상향 조정함.",
      category: "재정",
    },
    {
      id: "kp5",
      order: 5,
      title: "어르신 맞춤형 돌봄 서비스 확대",
      summary: "65세 이상 1인 가구 어르신을 대상으로 주 3회 방문 돌봄 서비스를 제공하고, 돌봄 사각지대를 해소함.",
      category: "복지",
    },
  ],
  detailedPledges: {
    "주거": [
      { id: "dp1", order: 1, title: "역세권 복합개발 사업 추진", summary: "주요 역세권 30개소를 선정하여 주거·상업·문화 복합시설 개발", category: "주거" },
      { id: "dp2", order: 2, title: "노후 공공임대 리모델링", summary: "준공 후 30년 이상 경과한 공공임대주택 전면 리모델링 시행", category: "주거" },
      { id: "dp3", order: 3, title: "신혼부부 전세자금 이자 지원", summary: "연소득 8천만원 이하 신혼부부 대상 전세자금 대출 이자 2% 지원", category: "주거" },
    ],
    "교통": [
      { id: "dp4", order: 1, title: "시내버스 노선 최적화", summary: "빅데이터 분석을 통한 시내버스 120개 노선 조정 및 신설", category: "교통" },
      { id: "dp5", order: 2, title: "자전거 전용도로 500km 확충", summary: "2029년까지 자전거 전용도로 500km 추가 조성", category: "교통" },
      { id: "dp6", order: 3, title: "심야 대중교통 운행 확대", summary: "심야 시간대 지하철·버스 운행 횟수 30% 증가", category: "교통" },
    ],
    "환경": [
      { id: "dp7", order: 1, title: "한강 수질 개선 프로젝트", summary: "한강 본류 및 지류 수질 1등급 달성을 위한 정화 시설 확충", category: "환경" },
      { id: "dp8", order: 2, title: "미세먼지 저감 특별 대책", summary: "계절관리제 기간 차량 2부제 강화 및 집진 시설 설치 확대", category: "환경" },
    ],
    "경제": [
      { id: "dp9", order: 1, title: "소상공인 디지털 전환 지원", summary: "소상공인 5만 개소 대상 무료 디지털 마케팅 교육 및 플랫폼 입점 지원", category: "경제" },
      { id: "dp10", order: 2, title: "스타트업 전용 펀드 1조원 조성", summary: "민간 투자 유치를 통한 스타트업 전용 펀드 1조원 조성", category: "경제" },
    ],
    "복지": [
      { id: "dp11", order: 1, title: "장애인 이동권 보장 강화", summary: "저상버스 100% 도입 및 지하철 엘리베이터 전 역사 설치 완료", category: "복지" },
      { id: "dp12", order: 2, title: "아동 급식 지원 대상 확대", summary: "기준 중위소득 100% 이하 가정 아동 전원 급식 지원", category: "복지" },
    ],
    "교육": [
      { id: "dp13", order: 1, title: "초등 돌봄교실 확대 운영", summary: "돌봄교실 운영 시간 오후 8시까지 연장 및 전 초등학교 설치", category: "교육" },
      { id: "dp14", order: 2, title: "대학생 학자금 이자 지원", summary: "서울 거주 대학생 학자금 대출 이자 50% 지원", category: "교육" },
    ],
  },
  history: [
    {
      id: "h1",
      year: 2014,
      electionName: "제6회 전국동시지방선거",
      party: "새누리당",
      district: "서울특별시 송파구갑",
      result: "elected",
    },
    {
      id: "h2",
      year: 2018,
      electionName: "제7회 전국동시지방선거",
      party: "자유한국당",
      district: "서울특별시장",
      result: "defeated",
    },
    {
      id: "h3",
      year: 2022,
      electionName: "제8회 전국동시지방선거",
      party: "국민의힘",
      district: "서울특별시장",
      result: "elected",
    },
    {
      id: "h4",
      year: 2026,
      electionName: "제9회 전국동시지방선거",
      party: "국민의힘",
      district: "서울특별시장",
      result: "elected",
    },
  ],
  pledgeChanges: {
    "h1-h2": {
      continued: ["대중교통 확충", "주거 안정화"],
      changed: [
        { before: "버스 노선 10개 신설", after: "버스 노선 20개 신설" },
      ],
      dropped: ["구 단위 특화 사업"],
      added: ["시 전역 스마트시티 구축", "한강 르네상스 2.0"],
    },
    "h2-h3": {
      continued: ["GTX 노선 추진", "주거 안정화"],
      changed: [
        { before: "공공임대 3만 호", after: "공공임대 5만 호" },
        { before: "재정자립도 65%", after: "재정자립도 68%" },
      ],
      dropped: ["한강 르네상스 2.0"],
      added: ["AI 행정 도입", "탄소중립 2050"],
    },
    "h3-h4": {
      continued: ["AI 행정 도입", "GTX 노선 추진", "탄소중립 정책"],
      changed: [
        { before: "공공임대 5만 호", after: "기본주택 10만 호" },
        { before: "재정자립도 68%", after: "재정자립도 70%" },
      ],
      dropped: [],
      added: ["GTX-D 조기 착공", "어르신 돌봄 확대"],
    },
  },
}

export const opponentCandidates: Pick<CandidateDetail, "id" | "name" | "party" | "number">[] = [
  { id: "g1", name: "김영호", party: "더불어민주당", number: 1 },
  { id: "g3", name: "이준혁", party: "정의당", number: 3 },
  { id: "g4", name: "최민서", party: "개혁신당", number: 4 },
  { id: "g6", name: "한소연", party: "무소속", number: 6 },
]
