import { CurriculumSubject } from '../../types/curriculum'

export const MIDDLE_SCHOOL_CURRICULUM: Record<number, CurriculumSubject[]> = {
  1: [
    {
      id: 'kor', name: '국어', icon: '📖', mainSubject: true,
      units: [
        { id: 'kor_1_1', name: '문학 감상' },
        { id: 'kor_1_2', name: '독서와 문법' },
        { id: 'kor_1_3', name: '화법과 작문' },
        { id: 'kor_1_4', name: '매체 언어' },
      ],
    },
    {
      id: 'math', name: '수학', icon: '📐', mainSubject: true,
      units: [
        { id: 'math_1_1', name: '소인수분해와 최대공약수·최소공배수' },
        { id: 'math_1_2', name: '정수와 유리수의 계산' },
        { id: 'math_1_3', name: '문자와 식' },
        { id: 'math_1_4', name: '일차방정식' },
        { id: 'math_1_5', name: '좌표평면과 그래프' },
        { id: 'math_1_6', name: '기본도형과 작도' },
        { id: 'math_1_7', name: '평면도형과 입체도형' },
        { id: 'math_1_8', name: '자료의 정리와 해석' },
      ],
    },
    {
      id: 'eng', name: '영어', icon: '🌎', mainSubject: true,
      units: [
        { id: 'eng_1_1', name: '일상생활 표현' },
        { id: 'eng_1_2', name: '읽기와 쓰기 기초' },
        { id: 'eng_1_3', name: '문법 기초 (시제·인칭)' },
        { id: 'eng_1_4', name: '듣기와 말하기' },
      ],
    },
    {
      id: 'soc', name: '사회', icon: '🌍', mainSubject: true,
      units: [
        { id: 'soc_1_1', name: '내가 사는 세계' },
        { id: 'soc_1_2', name: '우리와 다른 기후 환경' },
        { id: 'soc_1_3', name: '자연으로 떠나는 여행' },
        { id: 'soc_1_4', name: '다양한 세계, 다양한 문화' },
        { id: 'soc_1_5', name: '자연재해와 인간 생활' },
      ],
    },
    {
      id: 'sci', name: '과학', icon: '🔬', mainSubject: true,
      units: [
        { id: 'sci_1_1', name: '지권의 변화' },
        { id: 'sci_1_2', name: '여러 가지 힘' },
        { id: 'sci_1_3', name: '생물의 다양성' },
        { id: 'sci_1_4', name: '기체의 성질' },
        { id: 'sci_1_5', name: '물질의 상태변화' },
        { id: 'sci_1_6', name: '빛과 파동' },
      ],
    },
  ],
  2: [
    {
      id: 'kor', name: '국어', icon: '📖', mainSubject: true,
      units: [
        { id: 'kor_2_1', name: '문학의 이해와 감상' },
        { id: 'kor_2_2', name: '읽기 전략' },
        { id: 'kor_2_3', name: '쓰기의 원리' },
        { id: 'kor_2_4', name: '문법 요소' },
        { id: 'kor_2_5', name: '듣기·말하기의 방법' },
      ],
    },
    {
      id: 'math', name: '수학', icon: '📐', mainSubject: true,
      units: [
        { id: 'math_2_1', name: '유리수와 순환소수' },
        { id: 'math_2_2', name: '단항식과 다항식의 계산' },
        { id: 'math_2_3', name: '일차부등식' },
        { id: 'math_2_4', name: '연립일차방정식' },
        { id: 'math_2_5', name: '일차함수와 그래프' },
        { id: 'math_2_6', name: '일차함수와 일차방정식의 관계' },
        { id: 'math_2_7', name: '도형의 성질 (삼각형·사각형)' },
        { id: 'math_2_8', name: '도형의 닮음' },
        { id: 'math_2_9', name: '확률' },
      ],
    },
    {
      id: 'eng', name: '영어', icon: '🌎', mainSubject: true,
      units: [
        { id: 'eng_2_1', name: '의사소통 기능 표현' },
        { id: 'eng_2_2', name: '독해 전략' },
        { id: 'eng_2_3', name: '언어 형식 (관계대명사·수동태)' },
        { id: 'eng_2_4', name: '작문 기초' },
      ],
    },
    {
      id: 'soc', name: '사회', icon: '🌍', mainSubject: true,
      units: [
        { id: 'soc_2_1', name: '인권과 헌법' },
        { id: 'soc_2_2', name: '헌법과 국가기관' },
        { id: 'soc_2_3', name: '경제생활과 선택' },
        { id: 'soc_2_4', name: '시장경제와 가격' },
        { id: 'soc_2_5', name: '국민경제와 국제거래' },
      ],
    },
    {
      id: 'his', name: '역사', icon: '🏛️', mainSubject: true,
      units: [
        { id: 'his_2_1', name: '선사문화와 고대국가의 형성' },
        { id: 'his_2_2', name: '남북국시대의 전개' },
        { id: 'his_2_3', name: '고려의 성립과 변천' },
        { id: 'his_2_4', name: '조선의 성립과 발전' },
      ],
    },
    {
      id: 'sci', name: '과학', icon: '🔬', mainSubject: true,
      units: [
        { id: 'sci_2_1', name: '물질의 구성' },
        { id: 'sci_2_2', name: '전기와 자기' },
        { id: 'sci_2_3', name: '태양계' },
        { id: 'sci_2_4', name: '식물과 에너지' },
        { id: 'sci_2_5', name: '동물과 에너지' },
        { id: 'sci_2_6', name: '수권과 해수의 순환' },
      ],
    },
  ],
  3: [
    {
      id: 'kor', name: '국어', icon: '📖', mainSubject: true,
      units: [
        { id: 'kor_3_1', name: '문학과 사회' },
        { id: 'kor_3_2', name: '독서의 방법과 태도' },
        { id: 'kor_3_3', name: '화법과 작문의 원리' },
        { id: 'kor_3_4', name: '언어와 매체의 이해' },
      ],
    },
    {
      id: 'math', name: '수학', icon: '📐', mainSubject: true,
      units: [
        { id: 'math_3_1', name: '제곱근과 실수' },
        { id: 'math_3_2', name: '다항식의 곱셈과 인수분해' },
        { id: 'math_3_3', name: '이차방정식' },
        { id: 'math_3_4', name: '이차함수' },
        { id: 'math_3_5', name: '삼각비' },
        { id: 'math_3_6', name: '원의 성질' },
        { id: 'math_3_7', name: '통계 (대푯값과 산포도)' },
      ],
    },
    {
      id: 'eng', name: '영어', icon: '🌎', mainSubject: true,
      units: [
        { id: 'eng_3_1', name: '독해와 어휘 심화' },
        { id: 'eng_3_2', name: '문법 심화 (관계부사·분사구문)' },
        { id: 'eng_3_3', name: '작문 심화' },
        { id: 'eng_3_4', name: '통합 의사소통' },
      ],
    },
    {
      id: 'soc', name: '사회', icon: '🌍', mainSubject: true,
      units: [
        { id: 'soc_3_1', name: '개인과 사회생활' },
        { id: 'soc_3_2', name: '문화와 사회' },
        { id: 'soc_3_3', name: '정치생활과 민주주의' },
        { id: 'soc_3_4', name: '국제사회와 국제정치' },
        { id: 'soc_3_5', name: '사회변동과 사회문제' },
      ],
    },
    {
      id: 'his', name: '역사', icon: '🏛️', mainSubject: true,
      units: [
        { id: 'his_3_1', name: '일제강점기 민족운동' },
        { id: 'his_3_2', name: '광복과 대한민국 정부 수립' },
        { id: 'his_3_3', name: '민주화 운동' },
        { id: 'his_3_4', name: '현대사회의 변화와 과제' },
      ],
    },
    {
      id: 'sci', name: '과학', icon: '🔬', mainSubject: true,
      units: [
        { id: 'sci_3_1', name: '화학 반응의 규칙' },
        { id: 'sci_3_2', name: '기권과 날씨' },
        { id: 'sci_3_3', name: '운동과 에너지' },
        { id: 'sci_3_4', name: '자극과 반응' },
        { id: 'sci_3_5', name: '생식과 유전' },
        { id: 'sci_3_6', name: '에너지 전환과 보존' },
      ],
    },
  ],
}

export function getMiddleSchoolSubjects(grade: number): CurriculumSubject[] {
  return MIDDLE_SCHOOL_CURRICULUM[grade] ?? []
}
