import { TokenTransaction, TokenTransactionType, TokenSource, TokenWallet } from '../types'
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

/** 순수 함수: Transaction 목록만으로 지갑 잔액을 파생한다. 유닛 테스트 대상. */
export function deriveWallet(txs: TokenTransaction[]): TokenWallet {
  const purchasedBalance = txs.filter((t) => t.tokenSource === 'PURCHASED').reduce((s, t) => s + t.amount, 0)
  const rewardBalance = txs.filter((t) => t.tokenSource === 'REWARD').reduce((s, t) => s + t.amount, 0)
  const earned = txs.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const spent = txs.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)
  return { balance: purchasedBalance + rewardBalance, purchasedBalance, rewardBalance, earned, spent }
}

/** 순수 함수: 시험 응시 비용을 PURCHASED 우선, 부족분만 REWARD로 나눈다. 유닛 테스트 대상. */
export function splitSpendAcrossSources(
  purchasedBalance: number,
  rewardBalance: number,
  amount: number
): { fromPurchased: number; fromReward: number } {
  const fromPurchased = Math.max(0, Math.min(purchasedBalance, amount))
  const fromReward = Math.max(0, amount - fromPurchased)
  return { fromPurchased, fromReward }
}

function appendTransaction(userId: string, type: TokenTransactionType, tokenSource: TokenSource, amount: number, reason: string): TokenTransaction {
  const txs = getTransactions(userId)
  const signedAmount = type === 'SPEND' || type === 'CONVERT' ? -Math.abs(amount) : Math.abs(amount)
  const balanceAfter = deriveWallet(txs).balance + signedAmount
  const tx: TokenTransaction = {
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    userId,
    type,
    tokenSource,
    amount: signedAmount,
    reason,
    createdAt: new Date().toISOString(),
    balanceAfter,
  }
  txs.unshift(tx)
  saveTransactions(userId, txs)
  return tx
}

// 지갑 잔액은 전부 거래 원장에서 파생된다 — user.tokens는 화면 표시용 캐시일 뿐,
// 이 함수가 유일한 진실이다.
export function getWallet(userId: string): TokenWallet {
  return deriveWallet(getTransactions(userId))
}

export function earnReward(userId: string, amount: number, reason: string): TokenWallet {
  appendTransaction(userId, 'EARN', 'REWARD', amount, reason)
  return getWallet(userId)
}

export function earnBonus(userId: string, amount: number, reason: string): TokenWallet {
  appendTransaction(userId, 'BONUS', 'REWARD', amount, reason)
  return getWallet(userId)
}

export function purchaseTokens(userId: string, amount: number, reason: string): TokenWallet {
  appendTransaction(userId, 'PURCHASE', 'PURCHASED', amount, reason)
  return getWallet(userId)
}

/** 시험 응시 토큰 소비. PURCHASED_TOKEN을 먼저 쓰고, 모자란 만큼만 REWARD_TOKEN을 쓴다. */
export function spendForExam(userId: string, amount: number, reason: string): TokenWallet {
  const wallet = getWallet(userId)
  const { fromPurchased, fromReward } = splitSpendAcrossSources(wallet.purchasedBalance, wallet.rewardBalance, amount)
  if (fromPurchased > 0) appendTransaction(userId, 'SPEND', 'PURCHASED', fromPurchased, reason)
  if (fromReward > 0) appendTransaction(userId, 'SPEND', 'REWARD', fromReward, reason)
  return getWallet(userId)
}

/** 현금 전환. REWARD_TOKEN만 대상이며, 지급 Provider 성공을 확인한 뒤에만 호출해야 한다. */
export function convertRewardToCash(userId: string, tokenAmount: number, reason: string): TokenWallet {
  appendTransaction(userId, 'CONVERT', 'REWARD', tokenAmount, reason)
  return getWallet(userId)
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
  if (score >= 100) return TOKEN_REWARDS.score_100
  if (score >= 90) return TOKEN_REWARDS.score_90_99
  if (score >= 80) return TOKEN_REWARDS.score_80_89
  if (score >= 60) return TOKEN_REWARDS.score_60_79
  return TOKEN_REWARDS.score_below_60
}

export function canAfford(currentTokens: number, cost: number): boolean {
  return currentTokens >= cost
}

export function getStreakBonus(streak: number): number {
  if (streak >= 30) return TOKEN_REWARDS.streak_30day
  if (streak >= 7) return TOKEN_REWARDS.streak_7day
  return 0
}
