import { describe, it, expect } from 'vitest'
import { computeConversion, getMaxConvertibleTokens } from '../tokenEconomyConfig'
import { deriveWallet, splitSpendAcrossSources } from '../../services/tokenService'
import { TokenTransaction } from '../../types'

function tx(tokenSource: 'PURCHASED' | 'REWARD', amount: number): TokenTransaction {
  return {
    id: `t_${Math.random()}`,
    userId: 'u1',
    type: amount >= 0 ? 'EARN' : 'SPEND',
    tokenSource,
    amount,
    reason: 'test',
    createdAt: new Date().toISOString(),
    balanceAfter: 0,
  }
}

describe('computeConversion', () => {
  it('10 Reward Token -> 가치 ₩1,000, 수수료 10% ₩100, 지급 ₩900', () => {
    const r = computeConversion(10)
    expect(r.grossAmount).toBe(1000)
    expect(r.feeAmount).toBe(100)
    expect(r.netAmount).toBe(900)
  })

  it('50 Reward Token -> 가치 ₩5,000, 수수료 10% ₩500, 지급 ₩4,500', () => {
    const r = computeConversion(50)
    expect(r.grossAmount).toBe(5000)
    expect(r.feeAmount).toBe(500)
    expect(r.netAmount).toBe(4500)
  })

  it('100 Reward Token -> 가치 ₩10,000, 수수료 10% ₩1,000, 지급 ₩9,000', () => {
    const r = computeConversion(100)
    expect(r.grossAmount).toBe(10000)
    expect(r.feeAmount).toBe(1000)
    expect(r.netAmount).toBe(9000)
  })
})

describe('getMaxConvertibleTokens', () => {
  it('57 Reward Token -> 최대 전환 가능 50, 남은 Reward Token 7', () => {
    const max = getMaxConvertibleTokens(57)
    expect(max).toBe(50)
    expect(57 - max).toBe(7)
  })
})

describe('deriveWallet + getMaxConvertibleTokens (지갑 구성, 구매+리워드 합산 전환)', () => {
  it('22 Purchased + 50 Reward -> 총 Token 72, 현금 전환 가능 Token 70', () => {
    const wallet = deriveWallet([tx('PURCHASED', 22), tx('REWARD', 50)])
    expect(wallet.balance).toBe(72)
    expect(wallet.purchasedBalance).toBe(22)
    expect(wallet.rewardBalance).toBe(50)
    expect(getMaxConvertibleTokens(wallet.balance)).toBe(70)
  })

  it('Purchased Token만 50 -> 현금 전환 가능 Token 50 (구매 Token도 전환 대상)', () => {
    const wallet = deriveWallet([tx('PURCHASED', 50)])
    expect(wallet.rewardBalance).toBe(0)
    expect(getMaxConvertibleTokens(wallet.balance)).toBe(50)
  })
})

describe('splitSpendAcrossSources (PURCHASED 우선 소진)', () => {
  it('구매 잔액이 충분하면 전부 PURCHASED에서만 차감', () => {
    const { fromPurchased, fromReward } = splitSpendAcrossSources(10, 20, 5)
    expect(fromPurchased).toBe(5)
    expect(fromReward).toBe(0)
  })

  it('구매 잔액이 모자라면 부족분만 REWARD에서 차감', () => {
    const { fromPurchased, fromReward } = splitSpendAcrossSources(2, 20, 5)
    expect(fromPurchased).toBe(2)
    expect(fromReward).toBe(3)
  })

  it('구매 잔액이 0이면 전부 REWARD에서 차감', () => {
    const { fromPurchased, fromReward } = splitSpendAcrossSources(0, 20, 5)
    expect(fromPurchased).toBe(0)
    expect(fromReward).toBe(5)
  })
})
