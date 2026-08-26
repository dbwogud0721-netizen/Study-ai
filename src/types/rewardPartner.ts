// 카카오페이(현금 전환)와 완전히 독립된 리워드샵(게임/웹툰 재화 교환) 전용 타입.
// PayoutResult(types/reward.ts)는 KakaoPay Mock 전용이라 여기서 재사용하지 않는다.

export type RewardPartnerCategory = 'GAME' | 'WEBTOON'

export interface RewardPartner {
  id: string
  name: string
  category: RewardPartnerCategory
  logoUrl?: string
  status: 'DEMO' | 'PLANNED' | 'ACTIVE'
}

export interface PartnerRewardProduct {
  id: string
  partnerId: string
  title: string
  description: string
  tokenPrice: number
  valueKrw: number
  rewardType: 'GAME_CURRENCY' | 'WEBTOON_CURRENCY'
  active: boolean
}

export interface PartnerRedeemResult {
  success: boolean
  redeemedAt: string
  providerRef?: string
}
