import { CurriculumSubject } from '../../types/curriculum'

// 초등학교 6학년(현재 MVP에서 지원하는 유일한 초등 학년) 커리큘럼.
// 스펙상 핵심 4과목(국어/영어/수학/과학)만 지원한다.
export const ELEMENTARY_CURRICULUM: Record<number, CurriculumSubject[]> = {
  1: [
    {
      id: 'kor', name: '국어', icon: '📖', mainSubject: true,
      units: [
        { id: 'elem_kor_1', name: '이야기의 흐름 파악하기' },
        { id: 'elem_kor_2', name: '주장과 근거' },
        { id: 'elem_kor_3', name: '낱말의 뜻과 쓰임' },
        { id: 'elem_kor_4', name: '글의 짜임과 요약' },
      ],
    },
    {
      id: 'eng', name: '영어', icon: '🌎', mainSubject: true,
      units: [
        { id: 'elem_eng_1', name: '일상 대화 표현' },
        { id: 'elem_eng_2', name: '짧은 글 읽기' },
        { id: 'elem_eng_3', name: '기초 문법(시제·인칭)' },
      ],
    },
    {
      id: 'math', name: '수학', icon: '📐', mainSubject: true,
      units: [
        { id: 'elem_math_1', name: '분수의 나눗셈' },
        { id: 'elem_math_2', name: '소수의 나눗셈' },
        { id: 'elem_math_3', name: '비와 비율' },
        { id: 'elem_math_4', name: '직육면체의 부피와 겉넓이' },
        { id: 'elem_math_5', name: '원의 넓이' },
      ],
    },
    {
      id: 'sci', name: '과학', icon: '🔬', mainSubject: true,
      units: [
        { id: 'elem_sci_1', name: '지구와 달의 운동' },
        { id: 'elem_sci_2', name: '여러 가지 기체' },
        { id: 'elem_sci_3', name: '식물의 구조와 기능' },
        { id: 'elem_sci_4', name: '전기의 이용' },
      ],
    },
  ],
}

export function getElementarySubjects(): CurriculumSubject[] {
  return ELEMENTARY_CURRICULUM[1] ?? []
}
