// KakaoPay Mock 지급 결과. 실제 지급 성공 후에만 tokenService.convertRewardToCash로
// Reward Token을 차감한다(성공 전 차감 금지).
export interface PayoutResult {
  success: boolean
  paidAt: string
  providerRef?: string
}
