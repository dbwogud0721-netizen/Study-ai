import { CashRewardTransaction, CashRewardStatus } from '../types'
import { mockRewardProvider } from './payments/MockRewardProvider'

const KEY_PREFIX = 'studyai_cash_reward_'
function txKey(userId: string): string {
  return `${KEY_PREFIX}${userId}`
}

export function getCashTransactions(userId: string): CashRewardTransaction[] {
  try {
    return JSON.parse(localStorage.getItem(txKey(userId)) || '[]')
  } catch {
    return []
  }
}

function saveCashTransactions(userId: string, txs: CashRewardTransaction[]): void {
  localStorage.setItem(txKey(userId), JSON.stringify(txs.slice(0, 200)))
}

/** 시험 채점 직후 호출. amount가 0이면(Reward 대상 아님) 기록하지 않는다. */
export function recordCashReward(userId: string, examId: string, amount: number, score: number): CashRewardTransaction | null {
  if (amount <= 0) return null
  const tx: CashRewardTransaction = {
    id: `cash_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    userId,
    examId,
    amount,
    reason: `시험 ${score}점 달성 보상`,
    score,
    status: 'AVAILABLE',
    createdAt: new Date().toISOString(),
  }
  const txs = getCashTransactions(userId)
  txs.unshift(tx)
  saveCashTransactions(userId, txs)
  return tx
}

export interface CashWallet {
  available: number
  pending: number
  paidTotal: number
}

export function getCashWallet(userId: string): CashWallet {
  const txs = getCashTransactions(userId)
  const sum = (status: CashRewardStatus) => txs.filter((t) => t.status === status).reduce((s, t) => s + t.amount, 0)
  return {
    available: sum('AVAILABLE'),
    pending: sum('PAYOUT_REQUESTED'),
    paidTotal: sum('PAID'),
  }
}

export function getTodayCashRewardCount(userId: string): number {
  const today = new Date()
  return getCashTransactions(userId).filter((t) => {
    if (t.amount <= 0) return false
    const d = new Date(t.createdAt)
    return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate()
  }).length
}

/** Mock KakaoPay 지급 흐름: AVAILABLE → PAYOUT_REQUESTED → (MockRewardProvider 성공) → PAID */
export async function requestCashPayout(userId: string): Promise<{ amount: number; paidAt: string }> {
  const txs = getCashTransactions(userId)
  const amount = txs.filter((t) => t.status === 'AVAILABLE').reduce((s, t) => s + t.amount, 0)
  const requested = txs.map((t): CashRewardTransaction => (t.status === 'AVAILABLE' ? { ...t, status: 'PAYOUT_REQUESTED' } : t))
  saveCashTransactions(userId, requested)

  const result = await mockRewardProvider.requestPayout(userId, amount)

  const finalTxs = getCashTransactions(userId).map((t): CashRewardTransaction =>
    t.status === 'PAYOUT_REQUESTED' ? { ...t, status: result.success ? 'PAID' : 'AVAILABLE', paidAt: result.success ? result.paidAt : undefined } : t
  )
  saveCashTransactions(userId, finalTxs)

  return { amount, paidAt: result.paidAt }
}
