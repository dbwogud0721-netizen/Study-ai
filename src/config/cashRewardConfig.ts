// 실제 현금 Reward 정책. 전부 config로 분리 — 금액/기준은 아직 확정값이 아니며
// 언제든 바뀔 수 있다. Mock 지급이며 실제 KakaoPay 송금은 발생하지 않는다.

export interface CashRewardBand {
  minScore: number
  maxScore: number
  reward: number // 원(KRW)
}

export const CASH_REWARD_BANDS: CashRewardBand[] = [
  { minScore: 90, maxScore: 94, reward: 100 },
  { minScore: 95, maxScore: 99, reward: 300 },
  { minScore: 100, maxScore: 100, reward: 500 },
]

export function getCashRewardForScore(score: number): number {
  const band = CASH_REWARD_BANDS.find((b) => score >= b.minScore && score <= b.maxScore)
  return band?.reward ?? 0
}

// 난이도 등급 순서 — Eligibility의 minimumDifficulty 비교에 쓴다.
export const DIFFICULTY_RANK: Record<string, number> = { easy: 0, medium: 1, hard: 2, mixed: 1 }

export const REWARD_ELIGIBILITY_CONFIG = {
  minimumQuestionCount: 10,
  minimumDifficulty: 'medium' as const,
  dailyRewardLimit: 2,
  // 같은 과목+단원+시험종류 조합으로 하루 안에 이미 Reward를 받았으면 추가 지급 안 함(악용 방지).
  duplicateExamWindowHours: 24,
} as const
