import { TaxonomyMajorArea, findMajorArea, findMiddleAreas } from './taxonomyTypes'

export const MATH_TAXONOMY: TaxonomyMajorArea[] = [
  {
    id: 'algebra',
    name: '대수',
    middleAreas: [
      { id: 'exponent_log', name: '지수와 로그', minorAreas: ['계산형', '방정식/부등식'] },
      { id: 'trig', name: '삼각함수', minorAreas: ['그래프', '방정식/부등식'] },
      { id: 'sequence', name: '수열', minorAreas: ['등차/등비', '귀납적 정의'] },
    ],
  },
  {
    id: 'calculus1',
    name: '미적분Ⅰ',
    middleAreas: [
      { id: 'limit', name: '극한', minorAreas: ['수열의 극한', '함수의 극한'] },
      { id: 'differentiation', name: '미분', minorAreas: ['도함수 활용', '극대·극소', '그래프 추론'] },
      { id: 'integration', name: '적분', minorAreas: ['계산형', '넓이', '함수 추론'] },
    ],
  },
  {
    id: 'probability_stats',
    name: '확률과 통계',
    middleAreas: [
      { id: 'permutation', name: '경우의 수', minorAreas: ['순열/조합', '이항정리'] },
      { id: 'probability', name: '확률', minorAreas: ['조건부확률', '독립시행'] },
      { id: 'statistics', name: '통계', minorAreas: ['정규분포', '통계적 추정'] },
    ],
  },
]

export function getMathMajorArea(majorAreaId: string) {
  return findMajorArea(MATH_TAXONOMY, majorAreaId)
}

export function getMathMiddleAreas(majorAreaId: string) {
  return findMiddleAreas(MATH_TAXONOMY, majorAreaId)
}
