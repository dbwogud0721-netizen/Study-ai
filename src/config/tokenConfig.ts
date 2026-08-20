// 시험 모드별 토큰 소비량. examModeConfig.ts의 examMode id와 매핑된다.
export const TOKEN_COSTS: Record<string, number> = {
  mock_mini: 1,
  unit_focus: 2,
  practice_full: 3,
  mock_subject: 3,
  weakness_ai: 4,
  mock_full: 5,
  random_practice: 2,
  school_prep: 2,
}

export const TOKEN_REWARDS = {
  score_90_plus: 5,
  score_80_89: 3,
  score_70_79: 2,
  score_below_70: 1,
  streak_7day: 2,
  streak_30day: 5,
  daily_free: 1,
} as const

export const FREE_DAILY_QUESTIONS = 5

export const TOKEN_PACKAGES = [
  { id: 'pkg_10', tokens: 10, price: 1000, label: '10 토큰', bonus: 0, best: false },
  { id: 'pkg_30', tokens: 30, price: 2700, label: '30 토큰', bonus: 3, best: true },
  { id: 'pkg_60', tokens: 60, price: 4900, label: '60 토큰', bonus: 8, best: false },
  { id: 'pkg_120', tokens: 120, price: 8900, label: '120 토큰', bonus: 20, best: false },
] as const

export const INITIAL_TOKENS = 20
