import { RewardPaymentProvider } from './PaymentProvider'
import { PayoutResult } from '../../types'

// Placeholder — 실제 KakaoPay 지급 API 연동 전까지는 사용하지 않는다.
// API Key는 코드에 넣지 않는다(환경변수로 주입 예정).
export class KakaoPayRewardProvider implements RewardPaymentProvider {
  async requestPayout(_userId: string, _amount: number): Promise<PayoutResult> {
    throw new Error('KakaoPayRewardProvider is not implemented yet — use MockRewardProvider for now')
  }
}
