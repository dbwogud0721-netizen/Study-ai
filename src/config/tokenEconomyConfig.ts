// Token의 "돈으로서의 가치"와, 부모 결제금액을 서비스이용료/Reward Pool로 나누는 비율을 다룬다.
// 시험 점수별로 얼마나 버는지는 tokenConfig.ts가 담당한다.

/** 1 Reward Token = ₩100 상당 */
export const REWARD_TOKEN_VALUE_KRW = 100

/** 기본 분할 비율. 반드시 합이 1이어야 하며, 필요 시 이 값만 바꾸면 전체 구조에 반영된다. */
export const DEFAULT_SERVICE_FEE_RATE = 0.5
export const DEFAULT_REWARD_POOL_RATE = 0.5

/** 데모용 기본 월 구독료. 실제로는 부모가 결제 화면에서 금액을 확인/결제한다. */
export const MONTHLY_SUBSCRIPTION_KRW = 100000

export interface PaymentSplit {
  serviceFeeKrw: number
  rewardPoolKrw: number
}

/** 부모 결제 금액을 AI 학습 서비스 이용료 / 학생 Reward 예산으로 나눈다. */
export function splitSubscriptionPayment(totalPaymentKrw: number, rewardPoolRate = DEFAULT_REWARD_POOL_RATE): PaymentSplit {
  const rewardPoolKrw = Math.round(totalPaymentKrw * rewardPoolRate)
  return { rewardPoolKrw, serviceFeeKrw: totalPaymentKrw - rewardPoolKrw }
}

export function tokensToKrw(tokens: number): number {
  return tokens * REWARD_TOKEN_VALUE_KRW
}

/** KRW를 Token으로 바꿀 때는 항상 내림 — Reward Pool 잔여 한도를 넘겨 지급하지 않기 위함. */
export function krwToTokens(krw: number): number {
  return Math.floor(krw / REWARD_TOKEN_VALUE_KRW)
}

export interface RewardCatalogItem {
  id: string
  label: string
  tokenCost: number
  icon: string
}

/** 게임 재화 교환처 — Investor Demo용 Generic Asset. 실제 제휴 시 이 목록만 교체하면 된다. */
export const GAME_REWARD_CATALOG: RewardCatalogItem[] = [
  { id: 'game_moba', label: 'MOBA GAME 게임 재화', tokenCost: 50, icon: '🎮' },
  { id: 'game_fps', label: 'FPS GAME 게임 재화', tokenCost: 30, icon: '🎯' },
]

/** 웹툰 재화 교환처 — 네이버웹툰 쿠키와 같은 개념의 Generic Webtoon Reward. */
export const WEBTOON_REWARD_CATALOG: RewardCatalogItem[] = [
  { id: 'webtoon_30', label: '웹툰 재화', tokenCost: 30, icon: '🍪' },
  { id: 'webtoon_50', label: '웹툰 재화', tokenCost: 50, icon: '🍪' },
]
