// 시험 모드별 토큰 소비량. examModeConfig.ts의 examMode id와 매핑된다.
// (구 멀티스텝 시험 생성 화면에서 쓰던 값 — TokenPage 안내 목록 등 레거시 표시용으로 유지)
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

// 새 단일화면 시험 생성(ExamBuilder)의 토큰 소비량 — 문제 수 기준.
export const TOKEN_COST_BY_COUNT: Record<number, number> = { 5: 1, 10: 2, 30: 4 }
export const WEAKNESS_AI_SURCHARGE = 1

export function calculateExamTokenCost(questionCount: number, isWeaknessAi: boolean): number {
  const base = TOKEN_COST_BY_COUNT[questionCount] ?? 2
  return isWeaknessAi ? base + WEAKNESS_AI_SURCHARGE : base
}

export const TOKEN_REWARDS = {
  score_100: 7,
  score_90_99: 5,
  score_80_89: 3,
  score_60_79: 2,
  score_below_60: 1,
  streak_7day: 2,
  streak_30day: 5,
  daily_free: 1,
} as const

export const FREE_DAILY_QUESTIONS = 5

// 목표 점수 초과 달성 보너스. 토큰 수는 가장 저렴한 패키지(pkg_10 = 1,000원/10토큰) 기준
// 환산가로 산정한다: 5,000원 ÷ 100원/토큰 = 50 TOKEN.
export const TARGET_SCORE_BONUS = { won: 5000, tokens: 50 } as const

export const TOKEN_PACKAGES = [
  { id: 'pkg_10', tokens: 10, price: 1000, label: '10 토큰', bonus: 0, best: false },
  { id: 'pkg_30', tokens: 30, price: 2700, label: '30 토큰', bonus: 3, best: true },
  { id: 'pkg_60', tokens: 60, price: 4900, label: '60 토큰', bonus: 8, best: false },
  { id: 'pkg_120', tokens: 120, price: 8900, label: '120 토큰', bonus: 20, best: false },
] as const

export const INITIAL_TOKENS = 20
