import { CurriculumSubject } from '../../types/curriculum'

// 고등학교 내신(학교 교과목) 데이터. 수능/모의고사 응시 영역은 examSystem.ts에서 별도로 관리한다.
export const HIGH_SCHOOL_CURRICULUM: Record<number, CurriculumSubject[]> = {
  1: [
    {
      id: 'kor_common', name: '공통국어', icon: '📖', mainSubject: true,
      units: [
        { id: 'kor_c_1', name: '화법과 언어', semester: 1 },
        { id: 'kor_c_2', name: '독서와 매체', semester: 1 },
        { id: 'kor_c_3', name: '문학', semester: 2 },
        { id: 'kor_c_4', name: '작문', semester: 2 },
      ],
    },
    {
      id: 'math_common', name: '공통수학', icon: '📐', mainSubject: true,
      units: [
        { id: 'math_c_1', name: '다항식', semester: 1 },
        { id: 'math_c_2', name: '방정식과 부등식', semester: 1 },
        { id: 'math_c_3', name: '경우의 수', semester: 1 },
        { id: 'math_c_4', name: '도형의 방정식', semester: 2 },
        { id: 'math_c_5', name: '집합과 명제', semester: 2 },
        { id: 'math_c_6', name: '함수와 그래프', semester: 2 },
      ],
    },
    {
      id: 'eng_common', name: '공통영어', icon: '🌎', mainSubject: true,
      units: [
        { id: 'eng_c_1', name: '핵심 문법 정리', semester: 1 },
        { id: 'eng_c_2', name: '주제·요지 파악', semester: 1 },
        { id: 'eng_c_3', name: '빈칸 추론', semester: 2 },
        { id: 'eng_c_4', name: '장문 독해', semester: 2 },
      ],
    },
    {
      id: 'soc_integrated', name: '통합사회', icon: '🌍', mainSubject: true,
      units: [
        { id: 'soc_i_1', name: '인간, 사회, 환경과 행복' },
        { id: 'soc_i_2', name: '자연환경과 인간' },
        { id: 'soc_i_3', name: '생활공간과 사회' },
        { id: 'soc_i_4', name: '인권 보장과 헌법' },
        { id: 'soc_i_5', name: '시장경제와 금융' },
      ],
    },
    {
      id: 'sci_integrated', name: '통합과학', icon: '🔬', mainSubject: true,
      units: [
        { id: 'sci_i_1', name: '물질의 규칙성' },
        { id: 'sci_i_2', name: '자연의 구성물질' },
        { id: 'sci_i_3', name: '역학적 시스템' },
        { id: 'sci_i_4', name: '지구시스템' },
        { id: 'sci_i_5', name: '생명시스템' },
      ],
    },
    {
      id: 'korhis_1', name: '한국사', icon: '🏛️', mainSubject: true,
      units: [
        { id: 'korhis_1_1', name: '전근대 한국사의 이해' },
        { id: 'korhis_1_2', name: '근대 국민국가 수립운동' },
        { id: 'korhis_1_3', name: '일제강점기 민족운동' },
        { id: 'korhis_1_4', name: '대한민국의 발전' },
      ],
    },
  ],
  2: [
    {
      id: 'kor_reading', name: '독서', icon: '📖', mainSubject: true,
      units: [
        { id: 'kor_r_1', name: '사실적 읽기', semester: 1 },
        { id: 'kor_r_2', name: '추론적·비판적 읽기', semester: 2 },
      ],
    },
    {
      id: 'kor_lit', name: '문학', icon: '📖', mainSubject: true,
      units: [
        { id: 'kor_l_1', name: '고전 문학의 이해', semester: 1 },
        { id: 'kor_l_2', name: '현대 문학의 이해', semester: 2 },
      ],
    },
    {
      id: 'math_algebra', name: '대수', icon: '📐', mainSubject: true,
      units: [
        { id: 'math_a_1', name: '지수함수와 로그함수', semester: 1 },
        { id: 'math_a_2', name: '삼각함수', semester: 1 },
        { id: 'math_a_3', name: '수열', semester: 2 },
      ],
    },
    {
      id: 'math_calc1', name: '미적분Ⅰ', icon: '📐', mainSubject: true,
      units: [
        { id: 'math_c1_1', name: '함수의 극한과 연속', semester: 1 },
        { id: 'math_c1_2', name: '다항함수의 미분법', semester: 1 },
        { id: 'math_c1_3', name: '다항함수의 적분법', semester: 2 },
      ],
    },
    {
      id: 'math_probstat', name: '확률과 통계', icon: '📐', mainSubject: true,
      units: [
        { id: 'math_ps_1', name: '경우의 수와 순열·조합', semester: 1 },
        { id: 'math_ps_2', name: '확률', semester: 1 },
        { id: 'math_ps_3', name: '통계적 추정', semester: 2 },
      ],
    },
    {
      id: 'eng1', name: '영어Ⅰ', icon: '🌎', mainSubject: true,
      units: [
        { id: 'eng1_1', name: '글의 목적·요지 파악', semester: 1 },
        { id: 'eng1_2', name: '함축 의미 추론', semester: 2 },
      ],
    },
    {
      id: 'phy1', name: '물리학Ⅰ', icon: '🔬', mainSubject: true,
      units: [
        { id: 'phy1_1', name: '역학과 에너지', semester: 1 },
        { id: 'phy1_2', name: '물질과 전자기장', semester: 2 },
      ],
    },
    {
      id: 'chem1', name: '화학Ⅰ', icon: '🔬', mainSubject: true,
      units: [
        { id: 'chem1_1', name: '화학의 첫걸음', semester: 1 },
        { id: 'chem1_2', name: '원자의 세계와 화학결합', semester: 2 },
      ],
    },
    {
      id: 'bio1', name: '생명과학Ⅰ', icon: '🔬', mainSubject: true,
      units: [
        { id: 'bio1_1', name: '생명 시스템' },
        { id: 'bio1_2', name: '항상성과 몸의 조절' },
      ],
    },
    {
      id: 'earth1', name: '지구과학Ⅰ', icon: '🔬', mainSubject: true,
      units: [
        { id: 'earth1_1', name: '대기와 해양' },
        { id: 'earth1_2', name: '우주' },
      ],
    },
    {
      id: 'korgeo', name: '한국지리', icon: '🌍', mainSubject: true,
      units: [{ id: 'korgeo_1', name: '국토 인식과 지리 정보' }, { id: 'korgeo_2', name: '지형 환경과 인간 생활' }],
    },
    {
      id: 'lifeethics', name: '생활과 윤리', icon: '🌍', mainSubject: true,
      units: [{ id: 'lifeethics_1', name: '현대의 삶과 실천 윤리' }, { id: 'lifeethics_2', name: '생명과 윤리' }],
    },
  ],
  3: [
    {
      id: 'kor_media', name: '언어와 매체', icon: '📖', mainSubject: true,
      units: [{ id: 'kor_m_1', name: '언어의 본질과 국어의 규범' }, { id: 'kor_m_2', name: '매체 언어의 표현과 소통' }],
    },
    {
      id: 'kor_speech', name: '화법과 작문', icon: '📖', mainSubject: true,
      units: [{ id: 'kor_s_1', name: '화법의 원리' }, { id: 'kor_s_2', name: '작문의 원리' }],
    },
    {
      id: 'math_calc2', name: '미적분Ⅱ', icon: '📐', mainSubject: true,
      units: [{ id: 'math_c2_1', name: '여러 가지 함수의 미분' }, { id: 'math_c2_2', name: '여러 가지 함수의 적분' }],
    },
    {
      id: 'math_geo', name: '기하', icon: '📐', mainSubject: true,
      units: [{ id: 'math_g_1', name: '이차곡선' }, { id: 'math_g_2', name: '공간도형과 공간좌표' }, { id: 'math_g_3', name: '벡터' }],
    },
    {
      id: 'eng2', name: '영어Ⅱ', icon: '🌎', mainSubject: true,
      units: [{ id: 'eng2_1', name: '전체 흐름 파악' }, { id: 'eng2_2', name: '주어진 문장 넣기' }],
    },
    {
      id: 'phy2', name: '물리학Ⅱ', icon: '🔬', mainSubject: true,
      units: [{ id: 'phy2_1', name: '시공간과 운동' }, { id: 'phy2_2', name: '전자기와 양자' }],
    },
    {
      id: 'chem2', name: '화학Ⅱ', icon: '🔬', mainSubject: true,
      units: [{ id: 'chem2_1', name: '물질의 세 가지 상태와 용액' }, { id: 'chem2_2', name: '반응 속도와 화학 평형' }],
    },
    {
      id: 'bio2', name: '생명과학Ⅱ', icon: '🔬', mainSubject: true,
      units: [{ id: 'bio2_1', name: '생명과학의 역사' }, { id: 'bio2_2', name: '유전자와 생명공학' }],
    },
    {
      id: 'earth2', name: '지구과학Ⅱ', icon: '🔬', mainSubject: true,
      units: [{ id: 'earth2_1', name: '고체지구' }, { id: 'earth2_2', name: '대기와 해양의 상호작용' }],
    },
    {
      id: 'politics', name: '정치와 법', icon: '🌍', mainSubject: true,
      units: [{ id: 'politics_1', name: '민주주의와 헌법' }, { id: 'politics_2', name: '정치과정과 참여' }],
    },
    {
      id: 'economics', name: '경제', icon: '🌍', mainSubject: true,
      units: [{ id: 'economics_1', name: '경제생활과 경제문제' }, { id: 'economics_2', name: '시장과 경제활동' }],
    },
  ],
}

export function getHighSchoolSubjects(grade: number): CurriculumSubject[] {
  return HIGH_SCHOOL_CURRICULUM[grade] ?? []
}
