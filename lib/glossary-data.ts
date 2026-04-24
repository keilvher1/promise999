export interface GlossaryTerm {
  slug: string
  term: string
  chosung: string // ㄱㄴㄷ...
  definition: string
  background: string[]
  relatedPledges: {
    id: string
    election: string
    candidate: string
    pledgeTitle: string
  }[]
  relatedTerms: {
    slug: string
    term: string
  }[]
  source: string
  lastUpdated: string
}

export const CHOSUNG_INDEX = [
  'ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
] as const

export const glossaryTerms: GlossaryTerm[] = [
  {
    slug: 'local-allocation-tax',
    term: '지방교부세',
    chosung: 'ㅈ',
    definition: '중앙정부가 지방자치단체 간 재정력 격차를 조정하기 위해 내국세 일정 비율을 지방에 배분하는 재원이다.',
    background: [
      '지방교부세는 1961년 「지방교부세법」 제정과 함께 도입되었다. 당시 지방자치단체의 재정 자립도가 낮아 중앙정부 재원에 의존하는 구조가 형성되었고, 이를 제도적으로 뒷받침하기 위해 마련되었다. 현재 내국세 총액의 19.24%가 지방교부세 재원으로 편성된다.',
      '지방교부세는 보통교부세, 특별교부세, 부동산교부세, 소방안전교부세로 구분된다. 보통교부세는 전체의 97%를 차지하며, 기준재정수요액에서 기준재정수입액을 뺀 재정부족액을 기준으로 배분한다. 특별교부세는 재해 복구, 지역 현안 사업 등에 사용된다.',
      '지방교부세 규모는 국세 수입에 연동되어 있어 경기 변동에 따라 증감한다. 2023년 기준 지방교부세 총액은 약 66조 원이며, 이 중 서울특별시를 제외한 16개 광역자치단체와 226개 기초자치단체에 배분된다. 서울특별시는 재정자주도가 높아 보통교부세 불교부단체로 분류된다.'
    ],
    relatedPledges: [
      {
        id: 'pledge-2022-seoul-kim-1',
        election: '2022 서울시장 보궐선거',
        candidate: '김○○',
        pledgeTitle: '지방교부세 배분 기준 개선 촉구'
      },
      {
        id: 'pledge-2022-seoul-park-3',
        election: '2022 서울시장 보궐선거',
        candidate: '박○○',
        pledgeTitle: '수도권-비수도권 재정 격차 해소'
      },
      {
        id: 'pledge-2024-local-lee-7',
        election: '제9회 전국동시지방선거',
        candidate: '이○○',
        pledgeTitle: '지방재정 확충을 위한 교부세율 인상 건의'
      },
      {
        id: 'pledge-2024-local-choi-2',
        election: '제9회 전국동시지방선거',
        candidate: '최○○',
        pledgeTitle: '특별교부세 투명성 강화'
      }
    ],
    relatedTerms: [
      { slug: 'local-finance', term: '지방재정' },
      { slug: 'fiscal-equalization', term: '재정조정제도' },
      { slug: 'national-tax', term: '내국세' },
      { slug: 'local-tax', term: '지방세' },
      { slug: 'fiscal-decentralization', term: '재정분권' }
    ],
    source: '행정안전부 「지방교부세 해설」, 한국지방행정연구원',
    lastUpdated: '2024.05.15'
  },
  {
    slug: 'local-finance',
    term: '지방재정',
    chosung: 'ㅈ',
    definition: '지방자치단체가 공공서비스를 제공하기 위해 조달하고 관리하는 재원의 총체를 말한다.',
    background: [
      '지방재정은 지방세, 세외수입, 지방교부세, 국고보조금 등으로 구성된다. 지방자치단체의 재정 운영은 「지방재정법」에 따라 이루어지며, 매년 예산을 편성하여 지방의회의 의결을 거쳐 집행한다.',
      '2023년 기준 전국 지방자치단체의 총세입 규모는 약 400조 원이다. 이 중 자체재원 비율은 평균 50% 내외이며, 나머지는 이전재원(교부세, 보조금)으로 충당된다. 재정자립도는 자치단체별로 20%에서 80%까지 편차가 크다.'
    ],
    relatedPledges: [
      {
        id: 'pledge-2024-local-jung-1',
        election: '제9회 전국동시지방선거',
        candidate: '정○○',
        pledgeTitle: '지방재정 건전성 강화'
      }
    ],
    relatedTerms: [
      { slug: 'local-allocation-tax', term: '지방교부세' },
      { slug: 'local-tax', term: '지방세' },
      { slug: 'fiscal-independence', term: '재정자립도' }
    ],
    source: '행정안전부, 한국지방재정공제회',
    lastUpdated: '2024.04.20'
  },
  {
    slug: 'fiscal-decentralization',
    term: '재정분권',
    chosung: 'ㅈ',
    definition: '중앙정부에서 지방자치단체로 재정 권한과 책임을 이양하는 정책 방향을 말한다.',
    background: [
      '재정분권은 지방자치 강화의 핵심 과제로 논의되어 왔다. 2018년 정부는 「재정분권 추진 방안」을 발표하여 국세-지방세 비율을 7:3에서 6:4로 조정하겠다는 목표를 제시하였다.',
      '1단계 재정분권(2019-2020년)에서는 지방소비세율 인상, 소방직 국가직 전환 등이 시행되었다. 2단계 재정분권은 지방소득세 확대, 지방교부세 개편 등을 포함하며 현재 진행 중이다.'
    ],
    relatedPledges: [],
    relatedTerms: [
      { slug: 'local-finance', term: '지방재정' },
      { slug: 'local-allocation-tax', term: '지방교부세' }
    ],
    source: '기획재정부, 행정안전부',
    lastUpdated: '2024.03.10'
  },
  {
    slug: 'proportional-representation',
    term: '비례대표제',
    chosung: 'ㅂ',
    definition: '정당이 획득한 득표율에 비례하여 의석을 배분하는 선거 제도이다.',
    background: [
      '비례대표제는 정당 득표율과 의석 점유율 간의 비례성을 높이기 위해 도입된 제도이다. 한국에서는 1963년 국회의원 선거에서 처음 도입되었으며, 이후 여러 차례 제도 변경을 거쳤다.',
      '현행 국회의원 선거에서 비례대표 의석은 46석이며, 준연동형 비례대표제를 적용한다. 지방의회 선거에서도 비례대표 의원을 선출하며, 광역의회와 기초의회 모두 적용된다.'
    ],
    relatedPledges: [
      {
        id: 'pledge-2024-assembly-kim-5',
        election: '제22대 국회의원 선거',
        candidate: '김○○',
        pledgeTitle: '비례대표 의석 확대'
      }
    ],
    relatedTerms: [
      { slug: 'electoral-system', term: '선거제도' },
      { slug: 'mixed-member-proportional', term: '연동형 비례대표제' }
    ],
    source: '중앙선거관리위원회, 국회 법제실',
    lastUpdated: '2024.02.28'
  },
  {
    slug: 'local-council',
    term: '지방의회',
    chosung: 'ㅈ',
    definition: '주민의 선거로 구성되어 해당 지방자치단체의 의결 기관 역할을 수행하는 합의체 기관이다.',
    background: [
      '지방의회는 조례 제정·개정·폐지, 예산 심의·의결, 행정사무 감사·조사 등의 권한을 가진다. 광역의회(시·도의회)와 기초의회(시·군·구의회)로 구분되며, 의원 임기는 4년이다.',
      '2024년 현재 전국 17개 광역의회에 872명, 226개 기초의회에 2,988명의 의원이 활동하고 있다. 지방의원은 지역구 의원과 비례대표 의원으로 구성된다.'
    ],
    relatedPledges: [],
    relatedTerms: [
      { slug: 'local-government', term: '지방자치단체' },
      { slug: 'ordinance', term: '조례' }
    ],
    source: '전국시도의회의장협의회, 행정안전부',
    lastUpdated: '2024.05.01'
  },
  {
    slug: 'administrative-district',
    term: '행정구역',
    chosung: 'ㅎ',
    definition: '국가 행정 수행을 위해 지역을 구분한 단위로, 광역자치단체와 기초자치단체로 나뉜다.',
    background: [
      '대한민국의 행정구역은 1특별시, 6광역시, 1특별자치시, 8도, 1특별자치도의 17개 광역자치단체와 그 아래 226개 기초자치단체(시·군·구)로 구성된다.',
      '행정구역 개편은 인구 변화, 생활권 변화 등을 반영하여 이루어진다. 최근에는 인구 감소 지역의 통합 논의, 메가시티 구상 등이 진행되고 있다.'
    ],
    relatedPledges: [],
    relatedTerms: [
      { slug: 'local-government', term: '지방자치단체' },
      { slug: 'metropolitan-city', term: '광역시' }
    ],
    source: '행정안전부 「지방자치단체 행정구역 및 인구 현황」',
    lastUpdated: '2024.01.15'
  },
  {
    slug: 'national-subsidy',
    term: '국고보조금',
    chosung: 'ㄱ',
    definition: '중앙정부가 특정 사업 수행을 위해 지방자치단체에 교부하는 재원으로, 용도가 지정되어 있다.',
    background: [
      '국고보조금은 「보조금 관리에 관한 법률」에 따라 운영된다. 지방교부세와 달리 용도가 특정되어 있어 지방자치단체는 정해진 목적에만 사용할 수 있다.',
      '국고보조금 규모는 2023년 기준 약 100조 원이다. 복지, 교육, SOC 등 분야별로 배분되며, 지방비 매칭(대응투자)이 요구되는 경우가 많아 지방재정에 부담 요인이 되기도 한다.'
    ],
    relatedPledges: [],
    relatedTerms: [
      { slug: 'local-allocation-tax', term: '지방교부세' },
      { slug: 'local-finance', term: '지방재정' }
    ],
    source: '기획재정부, 행정안전부',
    lastUpdated: '2024.04.05'
  },
  {
    slug: 'voter-turnout',
    term: '투표율',
    chosung: 'ㅌ',
    definition: '선거인 수 대비 실제 투표에 참여한 유권자의 비율을 백분율로 나타낸 수치이다.',
    background: [
      '투표율은 민주주의 참여 수준을 나타내는 지표로 활용된다. 한국의 국회의원 선거 투표율은 1990년대 70% 이상에서 2000년대 50%대로 하락한 후, 최근 다시 상승 추세를 보이고 있다.',
      '2024년 제22대 국회의원 선거 투표율은 67.0%였다. 사전투표 제도 도입(2014년) 이후 사전투표율이 꾸준히 상승하고 있으며, 2024년 선거에서는 사전투표율이 31.3%를 기록하였다.'
    ],
    relatedPledges: [],
    relatedTerms: [
      { slug: 'early-voting', term: '사전투표' },
      { slug: 'electoral-participation', term: '선거 참여' }
    ],
    source: '중앙선거관리위원회 선거통계시스템',
    lastUpdated: '2024.04.15'
  }
]

export function getTermBySlug(slug: string): GlossaryTerm | undefined {
  return glossaryTerms.find(term => term.slug === slug)
}

export function getTermsByChosung(chosung: string): GlossaryTerm[] {
  return glossaryTerms.filter(term => term.chosung === chosung)
}

export function getAllTermsGroupedByChosung(): Record<string, GlossaryTerm[]> {
  return glossaryTerms.reduce((acc, term) => {
    if (!acc[term.chosung]) {
      acc[term.chosung] = []
    }
    acc[term.chosung].push(term)
    return acc
  }, {} as Record<string, GlossaryTerm[]>)
}
