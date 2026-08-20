import { TokenTransaction, TokenTransactionType, TokenWallet } from '../types'
import { TOKEN_REWARDS } from '../config/tokenConfig'

const TX_KEY_PREFIX = 'studyai_token_tx_'

function txKey(userId: string): string {
  return `${TX_KEY_PREFIX}${userId}`
}

export function getTransactions(userId: string): TokenTransaction[] {
  try {
    return JSON.parse(localStorage.getItem(txKey(userId)) || '[]')
  } catch {
    return []
  }
}

function saveTransactions(userId: string, txs: TokenTransaction[]): void {
  localStorage.setItem(txKey(userId), JSON.stringify(txs.slice(0, 200)))
}

// 토큰 이동은 전부 Transaction으로 기록된다. currentBalance는 호출측(user.tokens)이 들고 있는
// 최신 잔액이며, 반환된 balanceAfter를 다시 user.tokens에 반영(authService.saveUser)해야 한다.
export function recordTransaction(
  userId: string,
  currentBalance: number,
  type: TokenTransactionType,
  amount: number,
  reason: string
): { balanceAfter: number; tx: TokenTransaction } {
  const signedAmount = type === 'SPEND' ? -Math.abs(amount) : Math.abs(amount)
  const balanceAfter = currentBalance + signedAmount
  const tx: TokenTransaction = {
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    userId,
    type,
    amount: signedAmount,
    reason,
    createdAt: new Date().toISOString(),
    balanceAfter,
  }
  const txs = getTransactions(userId)
  txs.unshift(tx)
  saveTransactions(userId, txs)
  return { balanceAfter, tx }
}

export function getWallet(userId: string, currentBalance: number): TokenWallet {
  const txs = getTransactions(userId)
  const earned = txs.filter((t) => t.type === 'EARN' || t.type === 'BONUS').reduce((s, t) => s + t.amount, 0)
  const purchased = txs.filter((t) => t.type === 'PURCHASE').reduce((s, t) => s + t.amount, 0)
  const spent = txs.filter((t) => t.type === 'SPEND').reduce((s, t) => s + Math.abs(t.amount), 0)
  return { balance: currentBalance, earned, purchased, spent }
}

export function getMonthlyStats(userId: string, now: Date = new Date()): { earned: number; spent: number } {
  const txs = getTransactions(userId).filter((t) => {
    const d = new Date(t.createdAt)
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  })
  const earned = txs.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const spent = txs.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)
  return { earned, spent }
}

export function calculateReward(score: number): number {
  if (score >= 90) return TOKEN_REWARDS.score_90_plus
  if (score >= 80) return TOKEN_REWARDS.score_80_89
  if (score >= 70) return TOKEN_REWARDS.score_70_79
  return TOKEN_REWARDS.score_below_70
}

export function canAfford(currentTokens: number, cost: number): boolean {
  return currentTokens >= cost
}

export function getStreakBonus(streak: number): number {
  if (streak >= 30) return TOKEN_REWARDS.streak_30day
  if (streak >= 7) return TOKEN_REWARDS.streak_7day
  return 0
}
