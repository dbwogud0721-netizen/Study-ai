/** 과목 비특정 다단계 태그 트리 형태. 국어/수학/과학 taxonomy가 공유한다. */
export interface TaxonomyMiddleArea {
  id: string
  name: string
  minorAreas: string[]
}

export interface TaxonomyMajorArea {
  id: string
  name: string
  middleAreas: TaxonomyMiddleArea[]
}

export function findMajorArea(tree: TaxonomyMajorArea[], majorAreaId: string): TaxonomyMajorArea | undefined {
  return tree.find((m) => m.id === majorAreaId || m.name === majorAreaId)
}

export function findMiddleAreas(tree: TaxonomyMajorArea[], majorAreaId: string): TaxonomyMiddleArea[] {
  return findMajorArea(tree, majorAreaId)?.middleAreas ?? []
}
