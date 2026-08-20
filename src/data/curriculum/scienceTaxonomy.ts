import { TaxonomyMajorArea, findMajorArea, findMiddleAreas } from './taxonomyTypes'

export const SCIENCE_TAXONOMY: TaxonomyMajorArea[] = [
  {
    id: 'earth_science',
    name: '지구과학',
    middleAreas: [
      {
        id: 'atmosphere_ocean',
        name: '대기와 해양',
        minorAreas: ['대기-해양 상호작용', 'ENSO', '엘니뇨/라니냐', '자료 해석'],
      },
      { id: 'astronomy', name: '천체', minorAreas: ['별의 진화', '외계 행성계', '자료 해석'] },
      { id: 'earth_structure', name: '지구의 구조', minorAreas: ['판구조론', '지진파 해석'] },
    ],
  },
  {
    id: 'physics',
    name: '물리학',
    middleAreas: [
      { id: 'mechanics', name: '역학', minorAreas: ['운동량과 충격량', '역학적 에너지'] },
      { id: 'electromagnetism', name: '전자기', minorAreas: ['전기장', '자기장', '전자기 유도'] },
    ],
  },
  {
    id: 'chemistry',
    name: '화학',
    middleAreas: [
      { id: 'reaction', name: '화학 반응', minorAreas: ['양적 관계', '중화 반응'] },
      { id: 'periodic_table', name: '주기율표', minorAreas: ['주기적 성질', '화학 결합'] },
    ],
  },
]

export function getScienceMajorArea(majorAreaId: string) {
  return findMajorArea(SCIENCE_TAXONOMY, majorAreaId)
}

export function getScienceMiddleAreas(majorAreaId: string) {
  return findMiddleAreas(SCIENCE_TAXONOMY, majorAreaId)
}
