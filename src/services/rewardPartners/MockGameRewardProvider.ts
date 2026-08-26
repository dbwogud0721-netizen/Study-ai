import { RewardPartnerProvider } from './RewardPartnerProvider'
import { PartnerRewardProduct, PartnerRedeemResult } from '../../types'
import { GAME_PRODUCTS } from '../../data/rewardPartners'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

// 게임 재화 교환용 Mock. 카카오페이 MockRewardProvider와 완전히 별개 클래스 —
// 실제 송금/지급은 발생하지 않으며 failureRate만큼 실패를 시뮬레이션한다.
export class MockGameRewardProvider implements RewardPartnerProvider {
  constructor(private failureRate = 0.15) {}

  getProducts(): PartnerRewardProduct[] {
    return GAME_PRODUCTS.filter((p) => p.active)
  }

  async redeem(_userId: string, _productId: string): Promise<PartnerRedeemResult> {
    await delay(1200)
    if (Math.random() < this.failureRate) {
      return { success: false, redeemedAt: '' }
    }
    return { success: true, redeemedAt: new Date().toISOString(), providerRef: `mock_game_${Date.now()}` }
  }
}

export const mockGameRewardProvider = new MockGameRewardProvider()
