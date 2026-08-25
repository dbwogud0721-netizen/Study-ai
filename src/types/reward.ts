// KakaoPay Mock 지급 결과. 실제 지급 성공 후에만 rewardService.redeemTokens로
// Reward Token을 차감한다(성공 전 차감 금지).
export interface PayoutResult {
  success: boolean
  paidAt: string
  providerRef?: string
}

/** 부모가 결제한 학습 프로그램 이용료 1건. 결제 즉시 serviceFee/rewardPool로 분리된다. */
export interface SubscriptionPayment {
  id: string
  parentId: string
  studentId: string
  totalPaymentKrw: number
  serviceFeeKrw: number
  rewardPoolKrw: number
  paidAt: string
}

/** SubscriptionPayment 1건이 만든 학생의 이번 결제 주기 Reward 한도. */
export interface RewardPool {
  id: string
  studentId: string
  paymentId: string
  totalPoolKrw: number
  earnedKrw: number
  remainingKrw: number
  startedAt: string
  expiresAt: string
}

export type RewardTransactionType = 'EXAM_REWARD' | 'REDEEM_KAKAOPAY' | 'REDEEM_GAME' | 'REDEEM_WEBTOON'

/** 학생이 실제로 획득/사용한 Reward Token 원장. Wallet 잔액은 전부 여기서 파생된다. */
export interface RewardTransaction {
  id: string
  studentId: string
  examId?: string
  tokenAmount: number
  valueKrw: number
  score?: number
  type: RewardTransactionType
  reason: string
  createdAt: string
}
