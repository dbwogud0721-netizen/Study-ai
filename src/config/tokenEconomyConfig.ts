// Token의 "돈으로서의 가치"를 다루는 config. 시험에서 어떻게 벌고 쓰는지는
// tokenConfig.ts가 담당하고, 여기는 구매 상품 가격/현금 전환 공식만 다룬다.

export const TOKEN_VALUE_KRW = 100

export const TOKEN_PACKAGES = [
  { id: 'pkg_10', tokens: 10, price: 10 * TOKEN_VALUE_KRW, label: '10 TOKEN' },
  { id: 'pkg_20', tokens: 20, price: 20 * TOKEN_VALUE_KRW, label: '20 TOKEN' },
  { id: 'pkg_50', tokens: 50, price: 50 * TOKEN_VALUE_KRW, label: '50 TOKEN', best: true },
  { id: 'pkg_100', tokens: 100, price: 100 * TOKEN_VALUE_KRW, label: '100 TOKEN' },
] as const

export const CASH_CONVERSION_FEE_RATE = 0.1
export const CASH_CONVERSION_UNIT = 10

export interface ConversionBreakdown {
  grossAmount: number
  feeAmount: number
  netAmount: number
}

export function computeConversion(tokenAmount: number): ConversionBreakdown {
  const grossAmount = tokenAmount * TOKEN_VALUE_KRW
  const feeAmount = Math.round(grossAmount * CASH_CONVERSION_FEE_RATE)
  return { grossAmount, feeAmount, netAmount: grossAmount - feeAmount }
}

/** 보유 Token(구매+리워드 합산) 중 10개 단위로 전환 가능한 최대치(내림). */
export function getMaxConvertibleTokens(balance: number): number {
  return Math.floor(balance / CASH_CONVERSION_UNIT) * CASH_CONVERSION_UNIT
}
