import { RewardPartnerProvider } from './RewardPartnerProvider'
import { PartnerRewardProduct, PartnerRedeemResult } from '../../types'
import { WEBTOON_PRODUCTS } from '../../data/rewardPartners'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

// 웹툰 재화 교환용 Mock. 카카오페이 MockRewardProvider와 완전히 별개 클래스 —
// 실제 송금/지급은 발생하지 않으며 failureRate만큼 실패를 시뮬레이션한다.
export class MockWebtoonRewardProvider implements RewardPartnerProvider {
  constructor(private failureRate = 0.15) {}

  getProducts(): PartnerRewardProduct[] {
    return WEBTOON_PRODUCTS.filter((p) => p.active)
  }

  async redeem(_userId: string, _productId: string): Promise<PartnerRedeemResult> {
    await delay(1200)
    if (Math.random() < this.failureRate) {
      return { success: false, redeemedAt: '' }
    }
    return { success: true, redeemedAt: new Date().toISOString(), providerRef: `mock_webtoon_${Date.now()}` }
  }
}

export const mockWebtoonRewardProvider = new MockWebtoonRewardProvider()
