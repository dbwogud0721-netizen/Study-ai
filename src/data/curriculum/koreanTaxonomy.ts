/**
 * 국어 다단계 태그 트리. Question.majorArea/middleArea/minorArea 값이 여기서 나온다.
 * 독서는 middleArea에 제재(passageType), minorArea에 문제 유형을 쓴다.
 */
import { TaxonomyMajorArea, findMajorArea, findMiddleAreas } from './taxonomyTypes'

const READING_QUESTION_TYPES = [
  '중심 내용',
  '내용 일치',
  '내용 불일치',
  '세부 정보',
  '추론',
  '사례 적용',
  '보기 적용',
  '개념 관계',
  '논증 구조',
  '자료 해석',
  '어휘',
]

export const KOREAN_TAXONOMY: TaxonomyMajorArea[] = [
  {
    id: 'literature',
    name: '문학',
    middleAreas: [
      { id: 'modern_poetry', name: '현대시', minorAreas: ['화자/정서', '표현법', '보기 적용'] },
      { id: 'classic_poetry', name: '고전시가', minorAreas: ['작품 이해', '고어 해석', '표현법', '보기 적용'] },
      { id: 'modern_novel', name: '현대소설', minorAreas: ['인물', '갈등', '서술 방식', '보기 적용'] },
      { id: 'classic_novel', name: '고전소설', minorAreas: ['사건 전개', '인물 관계', '보기 적용'] },
      { id: 'drama_essay', name: '극/수필', minorAreas: ['인물', '표현법', '보기 적용'] },
    ],
  },
  {
    id: 'reading',
    name: '독서',
    middleAreas: [
      { id: 'humanities', name: '인문', minorAreas: READING_QUESTION_TYPES },
      { id: 'philosophy', name: '철학', minorAreas: READING_QUESTION_TYPES },
      { id: 'society', name: '사회', minorAreas: READING_QUESTION_TYPES },
      { id: 'law', name: '법', minorAreas: READING_QUESTION_TYPES },
      { id: 'economics', name: '경제', minorAreas: READING_QUESTION_TYPES },
      { id: 'science', name: '과학', minorAreas: READING_QUESTION_TYPES },
      { id: 'technology', name: '기술', minorAreas: READING_QUESTION_TYPES },
      { id: 'fusion', name: '융합', minorAreas: READING_QUESTION_TYPES },
    ],
  },
  {
    id: 'language_media',
    name: '언어와 매체',
    middleAreas: [
      { id: 'phonology', name: '음운', minorAreas: ['음운 변동', '표준 발음'] },
      { id: 'morphology', name: '단어', minorAreas: ['품사', '단어 형성'] },
      { id: 'syntax', name: '문장', minorAreas: ['문장 성분', '문장 구조', '높임법'] },
      { id: 'media', name: '매체', minorAreas: ['매체 자료 해석', '매체 언어 특성'] },
    ],
  },
  {
    id: 'speech_writing',
    name: '화법과 작문',
    middleAreas: [
      { id: 'speech', name: '화법', minorAreas: ['대화/발표', '토론/협상'] },
      { id: 'writing', name: '작문', minorAreas: ['개요/초고', '고쳐쓰기'] },
    ],
  },
]

export function getKoreanMajorArea(majorAreaId: string): TaxonomyMajorArea | undefined {
  return findMajorArea(KOREAN_TAXONOMY, majorAreaId)
}

export function getKoreanMiddleAreas(majorAreaId: string) {
  return findMiddleAreas(KOREAN_TAXONOMY, majorAreaId)
}
