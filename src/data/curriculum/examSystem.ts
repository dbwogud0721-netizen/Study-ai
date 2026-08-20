import { ExamSystemVersion } from '../../types/curriculum'

// 학교 교과목(curriculumSubjects)과 완전히 분리된 "수능/모의고사 응시 영역" 데이터.
// 대입제도가 바뀌면 이 배열에 새 버전을 추가하는 것만으로 앱 전체에 반영된다.
export const EXAM_SYSTEM_VERSIONS: ExamSystemVersion[] = [
  {
    id: 'v2022_revised',
    label: '2022 개정 교육과정 대입제도',
    entryYearFrom: 2025,
    entryYearTo: null,
    areas: [
      { id: 'korean', name: '국어' },
      { id: 'math', name: '수학' },
      { id: 'english', name: '영어' },
      { id: 'history', name: '한국사' },
      {
        id: 'inquiry',
        name: '탐구',
        choiceCount: 2,
        options: [
          { id: 'korgeo', name: '한국지리' },
          { id: 'worldgeo', name: '세계지리' },
          { id: 'lifeethics', name: '생활과 윤리' },
          { id: 'ethicsthought', name: '윤리와 사상' },
          { id: 'politics', name: '정치와 법' },
          { id: 'economics', name: '경제' },
          { id: 'society', name: '사회·문화' },
          { id: 'phy', name: '물리학' },
          { id: 'chem', name: '화학' },
          { id: 'bio', name: '생명과학' },
          { id: 'earth', name: '지구과학' },
        ],
      },
    ],
  },
]

export function getExamSystemVersion(entryYear: number): ExamSystemVersion {
  return (
    EXAM_SYSTEM_VERSIONS.find(
      (v) => entryYear >= v.entryYearFrom && (v.entryYearTo === null || entryYear <= v.entryYearTo)
    ) ?? EXAM_SYSTEM_VERSIONS[EXAM_SYSTEM_VERSIONS.length - 1]
  )
}
