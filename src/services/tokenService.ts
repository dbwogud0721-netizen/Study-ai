import { RewardTransaction, RewardTransactionType, TokenWallet, SubscriptionPayment, RewardPool } from '../types'
import { calculateScoreReward } from '../config/tokenConfig'
import { splitSubscriptionPayment, tokensToKrw, krwToTokens, MONTHLY_SUBSCRIPTION_KRW } from '../config/tokenEconomyConfig'

const TX_KEY_PREFIX = 'studyai_reward_tx_'
const PAYMENTS_KEY = 'studyai_subscription_payments'
const POOLS_KEY = 'studyai_reward_pools'

function txKey(studentId: string): string {
  return `${TX_KEY_PREFIX}${studentId}`
}

function readList<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch {
    return []
  }
}

function writeList<T>(key: string, list: T[]): void {
  localStorage.setItem(key, JSON.stringify(list))
}

export function getTransactions(studentId: string): RewardTransaction[] {
  return readList<RewardTransaction>(txKey(studentId))
}

function saveTransactions(studentId: string, txs: RewardTransaction[]): void {
  writeList(txKey(studentId), txs.slice(0, 200))
}

function appendTransaction(
  studentId: string,
  tokenAmount: number,
  type: RewardTransactionType,
  reason: string,
  extra: { examId?: string; score?: number } = {}
): RewardTransaction {
  const tx: RewardTransaction = {
    id: `rtx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    studentId,
    tokenAmount,
    valueKrw: tokensToKrw(tokenAmount),
    type,
    reason,
    createdAt: new Date().toISOString(),
    ...extra,
  }
  const txs = getTransactions(studentId)
  txs.unshift(tx)
  saveTransactions(studentId, txs)
  return tx
}

/** 순수 함수: Reward Transaction 원장만으로 지갑 잔액을 파생한다. 유닛 테스트 대상. */
export function deriveWallet(txs: RewardTransaction[]): TokenWallet {
  const earnedTotal = txs.filter((t) => t.tokenAmount > 0).reduce((s, t) => s + t.tokenAmount, 0)
  const redeemedTotal = txs.filter((t) => t.tokenAmount < 0).reduce((s, t) => s + Math.abs(t.tokenAmount), 0)
  return { balance: earnedTotal - redeemedTotal, earnedTotal, redeemedTotal }
}

// 학생 Wallet에는 "실제로 학습 성과를 통해 획득한 Reward"만 들어간다. 부모 결제 금액이나
// Reward Pool 한도는 절대 Wallet 잔액에 직접 반영하지 않는다 — 항상 이 원장에서만 파생된다.
export function getWallet(studentId: string): TokenWallet {
  return deriveWallet(getTransactions(studentId))
}

// ---- SubscriptionPayment / RewardPool ----

export function getSubscriptionPayments(studentId: string): SubscriptionPayment[] {
  return readList<SubscriptionPayment>(PAYMENTS_KEY).filter((p) => p.studentId === studentId)
}

export function getRewardPools(studentId: string): RewardPool[] {
  return readList<RewardPool>(POOLS_KEY).filter((p) => p.studentId === studentId)
}

/** 만료되지 않은 것 중 가장 최근 Pool. 없으면 null(= 이번 달 결제가 아직 없음). */
export function getActiveRewardPool(studentId: string, now: Date = new Date()): RewardPool | null {
  const pools = getRewardPools(studentId).filter((p) => new Date(p.expiresAt) > now)
  if (pools.length === 0) return null
  return pools.reduce((latest, p) => (new Date(p.startedAt) > new Date(latest.startedAt) ? p : latest))
}

function savePool(pool: RewardPool): void {
  const all = readList<RewardPool>(POOLS_KEY)
  const idx = all.findIndex((p) => p.id === pool.id)
  if (idx === -1) all.push(pool)
  else all[idx] = pool
  writeList(POOLS_KEY, all)
}

/**
 * 부모의 학습 프로그램 이용료 결제. 결제 즉시 serviceFee/rewardPool로 분리하고,
 * 이번 결제 주기용 RewardPool을 새로 만든다 — 학생에게 Reward Token을 바로 지급하지 않는다.
 */
export function createSubscriptionPayment(
  parentId: string,
  studentId: string,
  totalPaymentKrw: number,
  now: Date = new Date()
): { payment: SubscriptionPayment; pool: RewardPool } {
  const { serviceFeeKrw, rewardPoolKrw } = splitSubscriptionPayment(totalPaymentKrw)
  const payment: SubscriptionPayment = {
    id: `pay_${Date.now()}`,
    parentId,
    studentId,
    totalPaymentKrw,
    serviceFeeKrw,
    rewardPoolKrw,
    paidAt: now.toISOString(),
  }
  const expiresAt = new Date(now)
  expiresAt.setMonth(expiresAt.getMonth() + 1)
  const pool: RewardPool = {
    id: `pool_${Date.now()}`,
    studentId,
    paymentId: payment.id,
    totalPoolKrw: rewardPoolKrw,
    earnedKrw: 0,
    remainingKrw: rewardPoolKrw,
    startedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  }

  const payments = readList<SubscriptionPayment>(PAYMENTS_KEY)
  payments.unshift(payment)
  writeList(PAYMENTS_KEY, payments)
  savePool(pool)

  return { payment, pool }
}

/** 순수 함수: 점수 구간 보상(nominal)이 Pool 잔여 한도를 넘으면 남은 한도까지만 지급한다. */
export function capRewardByPool(nominalTokens: number, poolRemainingKrw: number): { tokens: number; capped: boolean } {
  const nominalValueKrw = tokensToKrw(nominalTokens)
  const awardedValueKrw = Math.min(nominalValueKrw, Math.max(0, poolRemainingKrw))
  const tokens = krwToTokens(awardedValueKrw)
  return { tokens, capped: tokens < nominalTokens }
}

/**
 * 시험 점수에 따른 Reward 지급. 실제 지급액은 그 학생의 활성 Reward Pool 잔여 한도를 넘을 수 없다.
 * Pool이 없거나(이번 달 결제 없음) 0원이 되면 추가 Reward는 지급하지 않는다.
 */
export function awardExamReward(
  studentId: string,
  examId: string,
  score: number
): { tokensAwarded: number; valueKrwAwarded: number; capped: boolean } {
  const nominalTokens = calculateScoreReward(score)
  const pool = getActiveRewardPool(studentId)
  const { tokens, capped } = capRewardByPool(nominalTokens, pool?.remainingKrw ?? 0)

  if (tokens > 0) {
    appendTransaction(studentId, tokens, 'EXAM_REWARD', `시험 ${score}점 보상`, { examId, score })
    if (pool) {
      const valueKrw = tokensToKrw(tokens)
      savePool({ ...pool, earnedKrw: pool.earnedKrw + valueKrw, remainingKrw: pool.remainingKrw - valueKrw })
    }
  }

  return { tokensAwarded: tokens, valueKrwAwarded: tokensToKrw(tokens), capped: nominalTokens > 0 && capped }
}

/** 획득 완료한 Reward Token만 사용할 수 있다 — KakaoPay/게임/웹툰 공통 차감 함수. */
export function redeemTokens(studentId: string, tokenAmount: number, type: RewardTransactionType, reason: string): TokenWallet {
  const wallet = getWallet(studentId)
  if (tokenAmount <= 0 || tokenAmount > wallet.balance) {
    throw new Error('보유 Reward Token이 부족합니다')
  }
  appendTransaction(studentId, -tokenAmount, type, reason)
  return getWallet(studentId)
}

export function getMonthlyEarnedKrw(studentId: string, now: Date = new Date()): number {
  return getTransactions(studentId)
    .filter((t) => t.type === 'EXAM_REWARD')
    .filter((t) => {
      const d = new Date(t.createdAt)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    })
    .reduce((s, t) => s + t.valueKrw, 0)
}

export function getMonthlyStats(studentId: string, now: Date = new Date()): { earned: number; spent: number } {
  const txs = getTransactions(studentId).filter((t) => {
    const d = new Date(t.createdAt)
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  })
  const earned = txs.filter((t) => t.tokenAmount > 0).reduce((s, t) => s + t.tokenAmount, 0)
  const spent = txs.filter((t) => t.tokenAmount < 0).reduce((s, t) => s + Math.abs(t.tokenAmount), 0)
  return { earned, spent }
}

/**
 * Investor Demo용 초기 데이터. 이 학생에게 Reward Pool이 하나도 없을 때만,
 * 이번 달 결제(₩100,000 → 서비스이용료 ₩50,000 / Reward Pool ₩50,000)와
 * 시험 성과로 87 Token(₩8,700)을 이미 획득한 상태를 만들어준다.
 */
export function seedDemoRewardDataIfEmpty(studentId: string, parentId = 'parent_001', now: Date = new Date()): void {
  if (getRewardPools(studentId).length > 0) return

  const { pool } = createSubscriptionPayment(parentId, studentId, MONTHLY_SUBSCRIPTION_KRW, now)

  const seedAwards: Array<{ tokens: number; score: number; daysAgo: number }> = [
    { tokens: 10, score: 100, daysAgo: 9 },
    { tokens: 10, score: 100, daysAgo: 8 },
    { tokens: 10, score: 100, daysAgo: 7 },
    { tokens: 10, score: 100, daysAgo: 6 },
    { tokens: 10, score: 100, daysAgo: 5 },
    { tokens: 10, score: 100, daysAgo: 4 },
    { tokens: 10, score: 100, daysAgo: 3 },
    { tokens: 10, score: 100, daysAgo: 2 },
    { tokens: 7, score: 95, daysAgo: 1 },
  ]

  // newest-first(index 0)로 저장하는 기존 원장 관례를 맞추기 위해 daysAgo 오름차순으로 뒤집는다.
  const txs: RewardTransaction[] = [...seedAwards]
    .reverse()
    .map((award, i) => ({
      id: `rtx_seed_${i}`,
      studentId,
      examId: `exam_seed_reward_${i}`,
      tokenAmount: award.tokens,
      valueKrw: tokensToKrw(award.tokens),
      score: award.score,
      type: 'EXAM_REWARD' as const,
      reason: `시험 ${award.score}점 보상`,
      createdAt: new Date(now.getTime() - award.daysAgo * 86400000).toISOString(),
    }))
  saveTransactions(studentId, txs)

  const earnedKrw = txs.reduce((s, t) => s + t.valueKrw, 0)
  savePool({ ...pool, earnedKrw, remainingKrw: pool.totalPoolKrw - earnedKrw })
}
