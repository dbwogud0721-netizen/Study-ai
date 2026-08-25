import { PayoutResult } from '../../types'

export interface RewardPaymentProvider {
  requestPayout(userId: string, amount: number): Promise<PayoutResult>
}
