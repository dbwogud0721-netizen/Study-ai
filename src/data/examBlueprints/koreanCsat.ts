import { BlueprintItem } from '../../types/exam'

/** 2022개정 수능 국어 실제 구성 참고(독서17/문학17/선택11=45문항). 콘텐츠는 AI가 새로 생성, 기출 복제 안 함. */
export const KOREAN_FULL_MOCK_BLUEPRINT: BlueprintItem[] = [
  { label: '독서', count: 17 },
  { label: '문학', count: 17 },
  { label: '언어와 매체', count: 11 },
]
export const KOREAN_FULL_MOCK_TOTAL = 45
export const KOREAN_FULL_MOCK_TIME_MINUTES = 80

export interface AreaMockDefault {
  /** 해당 영역 "전체 풀기" 기본 문항수 */
  fullCount: number
  /** 중영역 하나만 선택했을 때 기본 문항수 */
  perMiddleAreaCount: number
  /** AI 약점 집중 모드 기본 문항수 */
  aiWeaknessCount: number
}

/** 섹션 25: 문항 수는 configuration으로 조정 가능 — 이 값들이 기본값. */
export const KOREAN_AREA_MOCK_DEFAULTS: Record<string, AreaMockDefault> = {
  literature: { fullCount: 15, perMiddleAreaCount: 5, aiWeaknessCount: 15 },
  reading: { fullCount: 15, perMiddleAreaCount: 5, aiWeaknessCount: 15 },
  language_media: { fullCount: 11, perMiddleAreaCount: 4, aiWeaknessCount: 11 },
  speech_writing: { fullCount: 11, perMiddleAreaCount: 6, aiWeaknessCount: 11 },
}

/** 문항수 기준 예상 소요시간(분). 실제 수능 페이스(80분/45문항) 참고. */
export function estimateMinutesForCount(count: number): number {
  return Math.max(10, Math.round(count * 1.8))
}
