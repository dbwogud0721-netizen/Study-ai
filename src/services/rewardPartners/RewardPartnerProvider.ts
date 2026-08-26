import { PartnerRewardProduct, PartnerRedeemResult } from '../../types'

// 카카오페이 결제 Provider(services/payments/*)와 완전히 독립된 인터페이스.
// 실제 제휴 API가 붙으면 getProducts/redeem 구현만 교체하면 된다.
export interface RewardPartnerProvider {
  getProducts(): PartnerRewardProduct[]
  redeem(userId: string, productId: string): Promise<PartnerRedeemResult>
}
