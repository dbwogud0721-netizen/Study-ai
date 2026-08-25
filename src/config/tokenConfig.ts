// 시험은 구독료에 포함되어 항상 무료로 응시한다 — 점수 구간에 따라 Reward Token만 번다.
// "돈으로서의 가치"(1 Token = ₩얼마)와 결제 분리 비율은 tokenEconomyConfig.ts가 담당한다.

export const SCORE_REWARD_TIERS = {
  score_100: 10,
  score_90_99: 7,
  score_80_89: 3,
  score_below_80: 0,
} as const

export function calculateScoreReward(score: number): number {
  if (score >= 100) return SCORE_REWARD_TIERS.score_100
  if (score >= 90) return SCORE_REWARD_TIERS.score_90_99
  if (score >= 80) return SCORE_REWARD_TIERS.score_80_89
  return SCORE_REWARD_TIERS.score_below_80
}
