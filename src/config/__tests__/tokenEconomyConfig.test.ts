import { describe, it, expect } from 'vitest'
import { splitSubscriptionPayment, tokensToKrw, krwToTokens } from '../tokenEconomyConfig'
import { calculateScoreReward } from '../tokenConfig'
import { deriveWallet, capRewardByPool } from '../../services/tokenService'
import { RewardTransaction } from '../../types'

function tx(tokenAmount: number): RewardTransaction {
  return {
    id: `t_${Math.random()}`,
    studentId: 's1',
    tokenAmount,
    valueKrw: tokensToKrw(tokenAmount),
    type: tokenAmount >= 0 ? 'EXAM_REWARD' : 'REDEEM_KAKAOPAY',
    reason: 'test',
    createdAt: new Date().toISOString(),
  }
}

describe('splitSubscriptionPayment', () => {
  it('₩100,000 결제 -> 기본 50/50 분할로 서비스이용료 ₩50,000, Reward Pool ₩50,000', () => {
    const r = splitSubscriptionPayment(100000)
    expect(r.serviceFeeKrw).toBe(50000)
    expect(r.rewardPoolKrw).toBe(50000)
  })

  it('비율을 바꾸면(config) 분할도 바뀐다 — 서비스이용료 70%', () => {
    const r = splitSubscriptionPayment(100000, 0.3)
    expect(r.rewardPoolKrw).toBe(30000)
    expect(r.serviceFeeKrw).toBe(70000)
  })
})

describe('tokensToKrw / krwToTokens (1 Token = ₩100)', () => {
  it('10 Token -> ₩1,000', () => {
    expect(tokensToKrw(10)).toBe(1000)
  })

  it('₩1,300 -> 13 Token (내림)', () => {
    expect(krwToTokens(1300)).toBe(13)
  })

  it('₩1,399 -> 13 Token (100원 미만 절사)', () => {
    expect(krwToTokens(1399)).toBe(13)
  })
})

describe('calculateScoreReward', () => {
  it('100점 -> 10 TOKEN', () => {
    expect(calculateScoreReward(100)).toBe(10)
  })
  it('90~99점 -> 7 TOKEN', () => {
    expect(calculateScoreReward(90)).toBe(7)
    expect(calculateScoreReward(99)).toBe(7)
  })
  it('80~89점 -> 3 TOKEN', () => {
    expect(calculateScoreReward(80)).toBe(3)
    expect(calculateScoreReward(89)).toBe(3)
  })
  it('80점 미만 -> 0 TOKEN', () => {
    expect(calculateScoreReward(79)).toBe(0)
    expect(calculateScoreReward(0)).toBe(0)
  })
})

describe('capRewardByPool (Reward Pool 한도를 넘는 지급 금지)', () => {
  it('Pool 잔여가 충분하면 nominal 그대로 지급', () => {
    const r = capRewardByPool(10, 50000)
    expect(r.tokens).toBe(10)
    expect(r.capped).toBe(false)
  })

  it('Pool 잔여 ₩1,300뿐인데 100점(₩1,000 상당) 달성 -> 전액 지급, 한도 안 넘음', () => {
    const r = capRewardByPool(10, 1300)
    expect(r.tokens).toBe(10)
    expect(r.capped).toBe(false)
  })

  it('Pool 잔여 ₩300뿐인데 100점(10 TOKEN=₩1,000) 달성 -> ₩300만큼인 3 TOKEN만 지급', () => {
    const r = capRewardByPool(10, 300)
    expect(r.tokens).toBe(3)
    expect(r.capped).toBe(true)
  })

  it('Pool 잔여 0 -> 추가 Reward 지급 없음', () => {
    const r = capRewardByPool(10, 0)
    expect(r.tokens).toBe(0)
    expect(r.capped).toBe(true)
  })
})

describe('deriveWallet (획득 완료한 Reward Token만 잔액에 반영)', () => {
  it('87 획득 - 50 사용 = 37 잔액', () => {
    const wallet = deriveWallet([tx(50), tx(37), tx(-50)])
    expect(wallet.earnedTotal).toBe(87)
    expect(wallet.redeemedTotal).toBe(50)
    expect(wallet.balance).toBe(37)
  })
})
