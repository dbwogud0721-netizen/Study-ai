export type TokenTransactionType = 'EARN' | 'SPEND' | 'PURCHASE' | 'REFUND' | 'BONUS'

export interface TokenTransaction {
  id: string
  userId: string
  type: TokenTransactionType
  amount: number
  reason: string
  createdAt: string
  balanceAfter: number
}

export interface TokenWallet {
  balance: number
  earned: number
  purchased: number
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
