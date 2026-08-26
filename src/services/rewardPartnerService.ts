import { RewardPartnerProvider } from './rewardPartners/RewardPartnerProvider'
import { spendForPartnerReward } from './tokenService'
import { PartnerRewardProduct, PartnerRedeemResult, TokenWallet } from '../types'

export interface RedeemOutcome {
  result: PartnerRedeemResult
  wallet?: TokenWallet
}

/**
 * 파트너 리워드(게임/웹툰) 교환. Provider 지급 성공을 확인한 뒤에만
 * Reward Token을 차감한다 — 카카오페이(convertTokensToCash)와 동일 원칙이지만
 * 완전히 별개 경로(spendForPartnerReward)를 사용한다.
 */
export async function redeemPartnerReward(
  userId: string,
  product: PartnerRewardProduct,
  provider: RewardPartnerProvider
): Promise<RedeemOutcome> {
  const result = await provider.redeem(userId, product.id)
  if (!result.success) {
    return { result }
  }
  const wallet = spendForPartnerReward(userId, product.tokenPrice, `${product.title} 교환 (${product.tokenPrice} TOKEN)`)
  return { result, wallet }
}
