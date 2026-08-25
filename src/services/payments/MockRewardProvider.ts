import { RewardPaymentProvider } from './PaymentProvider'
import { PayoutResult } from '../../types'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

// 투자자 Demo용 Mock. 실제 송금은 발생하지 않는다. failureRate만큼의 확률로 실패
// 응답을 돌려줘서 "지급 실패 시 토큰 차감 안 함" 플로우를 시연할 수 있게 한다.
export class MockRewardProvider implements RewardPaymentProvider {
  constructor(private failureRate = 0.15) {}

  async requestPayout(_userId: string, _amount: number): Promise<PayoutResult> {
    await delay(1200)
    if (Math.random() < this.failureRate) {
      return { success: false, paidAt: '' }
    }
    return { success: true, paidAt: new Date().toISOString(), providerRef: `mock_${Date.now()}` }
  }
}

export const mockRewardProvider = new MockRewardProvider()
