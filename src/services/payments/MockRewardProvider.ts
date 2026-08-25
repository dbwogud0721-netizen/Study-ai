import { RewardPaymentProvider } from './PaymentProvider'
import { PayoutResult } from '../../types'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

// 투자자 Demo용 Mock. 실제 송금 없이 항상 성공한다.
export class MockRewardProvider implements RewardPaymentProvider {
  async requestPayout(_userId: string, _amount: number): Promise<PayoutResult> {
    await delay(1200)
    return { success: true, paidAt: new Date().toISOString(), providerRef: `mock_${Date.now()}` }
  }
}

export const mockRewardProvider = new MockRewardProvider()
