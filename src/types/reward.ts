// 게임 Token(TokenTransaction, token.ts)과 완전히 분리된 실제 현금 보상 Wallet.
// 절대 Token Wallet balance와 합산하지 않는다.

export type CashRewardStatus =
  | 'EARNED'
  | 'PENDING'
  | 'AVAILABLE'
  | 'PAYOUT_REQUESTED'
  | 'PAID'
  | 'REJECTED'

export interface CashRewardTransaction {
  id: string
  userId: string
  examId: string
  amount: number
  reason: string
  score: number
  status: CashRewardStatus
  createdAt: string
  paidAt?: string
}

/** 실제 서비스 전환 시 필요한 미성년자 확인 단계. MVP에서는 구조만 두고 게이팅은 하지 않는다. */
export type RewardVerificationStatus = 'UNVERIFIED' | 'PARENT_APPROVAL_REQUIRED' | 'VERIFIED'

export interface RewardEligibilityCheck {
  label: string
  passed: boolean
}

export interface RewardEligibilityResult {
  eligible: boolean
  maxCashReward: number
  checks: RewardEligibilityCheck[]
}

export interface PayoutResult {
  success: boolean
  paidAt: string
  providerRef?: string
}
