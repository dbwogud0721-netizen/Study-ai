import { TokenPurchaseRequest, StudentUser } from '../types'
import { TOKEN_PACKAGES } from '../config/tokenConfig'
import { recordTransaction } from './tokenService'
import { MOCK_PARENT } from '../data/mockUsers'

const STORAGE_KEY = 'studyai_payment_requests'

function getAll(): TokenPurchaseRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
    saveAll(MOCK_PARENT.pendingPaymentRequests)
    return MOCK_PARENT.pendingPaymentRequests
  } catch {
    return []
  }
}

function saveAll(reqs: TokenPurchaseRequest[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reqs))
}

export function getRequestsForStudent(studentId: string): TokenPurchaseRequest[] {
  return getAll().filter((r) => r.studentId === studentId)
}

export function getPendingRequestsForParent(studentIds: string[]): TokenPurchaseRequest[] {
  return getAll().filter((r) => studentIds.includes(r.studentId) && r.status === 'pending')
}

export function getRequestById(id: string): TokenPurchaseRequest | undefined {
  return getAll().find((r) => r.id === id)
}

export function requestTokenPurchase(student: StudentUser, productId: string): TokenPurchaseRequest {
  const product = TOKEN_PACKAGES.find((p) => p.id === productId)
  if (!product) throw new Error('존재하지 않는 상품입니다')
  const req: TokenPurchaseRequest = {
    id: `pay_${Date.now()}`,
    studentId: student.id,
    studentName: student.name,
    productId,
    tokens: product.tokens + product.bonus,
    price: product.price,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
  const all = getAll()
  all.unshift(req)
  saveAll(all)
  return req
}

export function rejectRequest(requestId: string): void {
  const all = getAll()
  const idx = all.findIndex((r) => r.id === requestId)
  if (idx === -1) return
  all[idx] = { ...all[idx], status: 'rejected' }
  saveAll(all)
}

// 승인은 상태만 'approved'로 바꾸고 결제확인 화면으로 넘긴다. 즉시 지급하지 않는다.
export function approveRequest(requestId: string): TokenPurchaseRequest | null {
  const all = getAll()
  const idx = all.findIndex((r) => r.id === requestId)
  if (idx === -1) return null
  all[idx] = { ...all[idx], status: 'approved' }
  saveAll(all)
  return all[idx]
}

// Mock 결제 성공 후에만 실제로 토큰을 지급하고 거래를 기록한다.
export function confirmMockPayment(requestId: string, studentCurrentTokens: number): { balanceAfter: number } | null {
  const all = getAll()
  const idx = all.findIndex((r) => r.id === requestId)
  if (idx === -1) return null
  const req = all[idx]
  const { balanceAfter } = recordTransaction(
    req.studentId,
    studentCurrentTokens,
    'PURCHASE',
    req.tokens,
    `토큰 충전 ${req.tokens} TOKEN (보호자 결제)`
  )
  all[idx] = { ...req, status: 'paid' }
  saveAll(all)
  return { balanceAfter }
}
