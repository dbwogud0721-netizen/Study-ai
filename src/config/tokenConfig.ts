// 시험 응시 토큰 소비량 — 문제 수·시험 종류와 무관하게 항상 동일하다(단순함 우선).
export const EXAM_TOKEN_COST = 5

export const TOKEN_REWARDS = {
  score_90_plus: 10,
  score_80_89: 3,
  score_60_79: 2,
  score_below_60: 1,
  streak_7day: 2,
  streak_30day: 5,
  daily_free: 1,
} as const

export const FREE_DAILY_QUESTIONS = 5

export const INITIAL_TOKENS = 20
