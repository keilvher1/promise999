export interface Candidate {
  id: string
  number: number // 기호
  name: string
  party: string
  status: "elected" | "defeated" | "withdrew" | "running"
  pledgeCount: number
}

export interface BallotType {
  id: string
  number: string
  label: string
  candidates: Candidate[]
}

export interface Election {
  id: string
  title: string
  date: string
  voterCount: string
  candidateCount: string
  ballots: BallotType[]
}

// Sample data for Seoul
export const seoulElection: Election = {
  id: "local-2026",
  title: "제9회 전국동시지방선거",
  date: "2026년 6월 3일 (수)",
  voterCount: "약 4,430만 명",
  candidateCount: "약 9,200명",
  ballots: [
    {
      id: "governor",
      number: "①",
      label: "시·도지사",
      candidates: [
        { id: "g1", number: 1, name: "김영호", party: "더불어민주당", status: "running", pledgeCount: 42 },
        { id: "g2", number: 2, name: "박성민", party: "국민의힘", status: "running", pledgeCount: 38 },
        { id: "g3", number: 3, name: "이준혁", party: "정의당", status: "running", pledgeCount: 35 },
        { id: "g4", number: 4, name: "최민서", party: "개혁신당", status: "running", pledgeCount: 28 },
        { id: "g5", number: 5, name: "정우진", party: "진보당", status: "withdrew", pledgeCount: 22 },
        { id: "g6", number: 6, name: "한소연", party: "무소속", status: "running", pledgeCount: 31 },
      ],
    },
    {
      id: "education",
      number: "②",
      label: "교육감",
      candidates: [
        { id: "e1", number: 1, name: "임지현", party: "무소속", status: "running", pledgeCount: 45 },
        { id: "e2", number: 2, name: "송태준", party: "무소속", status: "running", pledgeCount: 39 },
        { id: "e3", number: 3, name: "유민정", party: "무소속", status: "running", pledgeCount: 41 },
        { id: "e4", number: 4, name: "배현우", party: "무소속", status: "running", pledgeCount: 36 },
        { id: "e5", number: 5, name: "노서윤", party: "무소속", status: "withdrew", pledgeCount: 28 },
        { id: "e6", number: 6, name: "강동훈", party: "무소속", status: "running", pledgeCount: 33 },
      ],
    },
    {
      id: "metro-proportional",
      number: "③",
      label: "광역의원 비례대표",
      candidates: [
        { id: "mp1", number: 1, name: "더불어민주당", party: "더불어민주당", status: "running", pledgeCount: 52 },
        { id: "mp2", number: 2, name: "국민의힘", party: "국민의힘", status: "running", pledgeCount: 48 },
        { id: "mp3", number: 3, name: "정의당", party: "정의당", status: "running", pledgeCount: 44 },
        { id: "mp4", number: 4, name: "개혁신당", party: "개혁신당", status: "running", pledgeCount: 38 },
        { id: "mp5", number: 5, name: "진보당", party: "진보당", status: "running", pledgeCount: 35 },
        { id: "mp6", number: 6, name: "기본소득당", party: "기본소득당", status: "running", pledgeCount: 30 },
      ],
    },
    {
      id: "metro-district",
      number: "④",
      label: "광역의원 지역구",
      candidates: [
        { id: "md1", number: 1, name: "오승현", party: "더불어민주당", status: "running", pledgeCount: 28 },
        { id: "md2", number: 2, name: "신재원", party: "국민의힘", status: "running", pledgeCount: 25 },
        { id: "md3", number: 3, name: "권다은", party: "정의당", status: "running", pledgeCount: 23 },
        { id: "md4", number: 4, name: "문성호", party: "개혁신당", status: "running", pledgeCount: 20 },
        { id: "md5", number: 5, name: "안지윤", party: "무소속", status: "withdrew", pledgeCount: 18 },
        { id: "md6", number: 6, name: "조현석", party: "무소속", status: "running", pledgeCount: 22 },
      ],
    },
    {
      id: "district-head",
      number: "⑤",
      label: "시·군·구청장",
      candidates: [
        { id: "dh1", number: 1, name: "황준서", party: "더불어민주당", status: "running", pledgeCount: 35 },
        { id: "dh2", number: 2, name: "서예린", party: "국민의힘", status: "running", pledgeCount: 32 },
        { id: "dh3", number: 3, name: "장민기", party: "정의당", status: "running", pledgeCount: 29 },
        { id: "dh4", number: 4, name: "윤하나", party: "무소속", status: "running", pledgeCount: 26 },
        { id: "dh5", number: 5, name: "임태현", party: "무소속", status: "running", pledgeCount: 24 },
        { id: "dh6", number: 6, name: "고서준", party: "개혁신당", status: "withdrew", pledgeCount: 21 },
      ],
    },
    {
      id: "basic-district",
      number: "⑥",
      label: "기초의원 지역구",
      candidates: [
        { id: "bd1", number: 1, name: "백소민", party: "더불어민주당", status: "running", pledgeCount: 18 },
        { id: "bd2", number: 2, name: "나현우", party: "국민의힘", status: "running", pledgeCount: 16 },
        { id: "bd3", number: 3, name: "심유진", party: "정의당", status: "running", pledgeCount: 15 },
        { id: "bd4", number: 4, name: "천지훈", party: "무소속", status: "running", pledgeCount: 14 },
        { id: "bd5", number: 5, name: "마서영", party: "무소속", status: "withdrew", pledgeCount: 12 },
        { id: "bd6", number: 6, name: "류승민", party: "개혁신당", status: "running", pledgeCount: 13 },
      ],
    },
    {
      id: "basic-proportional",
      number: "⑦",
      label: "기초의원 비례대표",
      candidates: [
        { id: "bp1", number: 1, name: "더불어민주당", party: "더불어민주당", status: "running", pledgeCount: 22 },
        { id: "bp2", number: 2, name: "국민의힘", party: "국민의힘", status: "running", pledgeCount: 20 },
        { id: "bp3", number: 3, name: "정의당", party: "정의당", status: "running", pledgeCount: 18 },
        { id: "bp4", number: 4, name: "개혁신당", party: "개혁신당", status: "running", pledgeCount: 16 },
        { id: "bp5", number: 5, name: "진보당", party: "진보당", status: "running", pledgeCount: 15 },
        { id: "bp6", number: 6, name: "기본소득당", party: "기본소득당", status: "running", pledgeCount: 14 },
      ],
    },
  ],
}

export const pledgeHighlights = [
  { id: "p1", text: "2027년까지 서울 전역 무상급식 확대 시행", candidate: "김영호", party: "더불어민주당" },
  { id: "p2", text: "GTX-D 노선 조기 착공 추진", candidate: "박성민", party: "국민의힘" },
  { id: "p3", text: "청년 주거비 월 30만원 지원 사업", candidate: "이준혁", party: "정의당" },
  { id: "p4", text: "소상공인 임대료 인상률 상한제 도입", candidate: "최민서", party: "개혁신당" },
  { id: "p5", text: "전 구민 대상 기본소득 시범사업 실시", candidate: "한소연", party: "무소속" },
  { id: "p6", text: "초등학교 돌봄교실 저녁 8시까지 연장", candidate: "임지현", party: "무소속" },
  { id: "p7", text: "대기오염 측정소 2배 확충 계획", candidate: "황준서", party: "더불어민주당" },
  { id: "p8", text: "1인 가구 안심 주거 패키지 제공", candidate: "서예린", party: "국민의힘" },
]

export const turnoutHistory = [
  { year: 2006, rate: 51.6 },
  { year: 2010, rate: 54.5 },
  { year: 2014, rate: 56.8 },
  { year: 2018, rate: 60.2 },
  { year: 2022, rate: 50.9 },
]

export const seatChanges = [
  { party: "더불어민주당", previous: 168, current: 175 },
  { party: "국민의힘", previous: 145, current: 138 },
  { party: "정의당", previous: 12, current: 15 },
  { party: "기타", previous: 25, current: 22 },
]
