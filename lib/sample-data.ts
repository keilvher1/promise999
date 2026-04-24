import type { Candidate } from "@/components/candidate-card"

export const sampleCandidates: Candidate[] = [
  {
    id: "1",
    name: "김민수",
    party: "국민의힘",
    region: "서울 종로구",
    status: "elected",
    birthYear: 1968,
    occupation: "변호사",
    pledges: [
      "종로구 내 노후 주거지역 재개발 추진",
      "어르신 일자리 1,000개 창출",
      "청년 창업 지원센터 설립",
      "대중교통 무료 환승 시스템 확대",
      "소상공인 임대료 지원 확대"
    ]
  },
  {
    id: "2",
    name: "이영희",
    party: "더불어민주당",
    region: "서울 종로구",
    status: "defeated",
    birthYear: 1972,
    occupation: "시민단체 대표",
    pledges: [
      "지역 내 공원 녹지 공간 확충",
      "무상급식 전 학년 확대 시행",
      "돌봄 서비스 24시간 운영",
      "여성 안심 귀갓길 조성",
      "전통시장 현대화 사업 추진"
    ]
  },
  {
    id: "3",
    name: "박철호",
    party: "조국혁신당",
    region: "서울 마포구",
    status: "elected",
    birthYear: 1975,
    occupation: "대학교수",
    pledges: [
      "마포구 청년 주거 지원 정책 강화",
      "문화예술 공간 신설",
      "지역 상권 활성화 프로젝트",
      "환경 친화적 도시계획 수립",
      "교육 인프라 현대화"
    ]
  },
  {
    id: "4",
    name: "정수진",
    party: "국민의힘",
    region: "부산 해운대구",
    status: "undecided",
    birthYear: 1980,
    occupation: "기업인",
    pledges: [
      "해운대 관광 인프라 확충",
      "지역 중소기업 해외 진출 지원",
      "청년 고용 촉진 정책",
      "해양 환경 보전 사업",
      "의료 복지 시설 확대"
    ]
  },
  {
    id: "5",
    name: "최동훈",
    party: "더불어민주당",
    region: "부산 해운대구",
    status: "undecided",
    birthYear: 1965,
    occupation: "의사",
    pledges: [
      "지역 의료 시스템 개선",
      "노인 건강관리 프로그램 확대",
      "응급의료 서비스 강화",
      "건강 도시 조성 사업",
      "의료 취약계층 지원 확대"
    ]
  },
  {
    id: "6",
    name: "한지민",
    party: "개혁신당",
    region: "경기 성남시",
    status: "defeated",
    birthYear: 1978,
    occupation: "사회복지사",
    pledges: [
      "아동 복지 시설 확충",
      "다문화 가정 지원 프로그램",
      "지역 사회 안전망 구축",
      "장애인 접근성 개선 사업",
      "저소득층 주거 안정 지원"
    ]
  },
  {
    id: "7",
    name: "윤상철",
    party: "무소속",
    region: "경기 성남시",
    status: "elected",
    birthYear: 1970,
    occupation: "전직 공무원",
    pledges: [
      "행정 효율화 및 투명성 강화",
      "지역 균형 발전 정책",
      "교통 체증 해소 대책",
      "친환경 에너지 도시 조성",
      "시민 참여형 예산 제도 확대"
    ]
  },
  {
    id: "8",
    name: "송미래",
    party: "녹색정의당",
    region: "대전 유성구",
    status: "defeated",
    birthYear: 1985,
    occupation: "환경운동가",
    pledges: [
      "탄소 중립 도시 선언",
      "신재생 에너지 확대",
      "녹색 일자리 창출",
      "생태계 복원 사업",
      "친환경 대중교통 체계 구축"
    ]
  },
  {
    id: "9",
    name: "오준혁",
    party: "국민의힘",
    region: "대전 유성구",
    status: "elected",
    birthYear: 1973,
    occupation: "연구원",
    pledges: [
      "과학기술 연구개발 투자 확대",
      "첨단산업 클러스터 조성",
      "대덕특구 글로벌화 추진",
      "스타트업 생태계 강화",
      "인재 유치 및 양성 프로그램"
    ]
  },
  {
    id: "10",
    name: "임서연",
    party: "더불어민주당",
    region: "광주 북구",
    status: "undecided",
    birthYear: 1982,
    occupation: "교사",
    pledges: [
      "공교육 내실화 정책",
      "방과후 돌봄 서비스 확대",
      "학교 시설 현대화",
      "교원 처우 개선",
      "학생 인권 보호 강화"
    ]
  }
]

export const regions = Array.from(
  new Set(sampleCandidates.map((c) => c.region))
).sort()

export const parties = Array.from(
  new Set(sampleCandidates.map((c) => c.party))
).sort()
