export type TokenTransactionType = 'EARN' | 'SPEND' | 'PURCHASE' | 'REFUND' | 'BONUS' | 'CONVERT'

/** PURCHASED = 현금으로 구매한 토큰(현금 전환 불가). REWARD = 시험 성적으로 번 토큰(현금 전환 가능). */
export type TokenSource = 'PURCHASED' | 'REWARD'

export interface TokenTransaction {
  id: string
  userId: string
  type: TokenTransactionType
  tokenSource: TokenSource
  amount: number
  reason: string
  createdAt: string
  balanceAfter: number
}

export interface TokenWallet {
  balance: number
  purchasedBalance: number
  rewardBalance: number
  earned: number
  spent: number
}

export type PaymentRequestStatus = 'pending' | 'approved' | 'rejected' | 'paid'

export interface TokenPurchaseRequest {
  id: string
  studentId: string
  studentName: string
  productId: string
  tokens: number
  price: number
  status: PaymentRequestStatus
  createdAt: string
}
