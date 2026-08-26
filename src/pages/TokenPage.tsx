import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, ArrowUpCircle, ArrowDownCircle, Gift, Check, Minus, Wallet } from 'lucide-react'
import { MobileLayout } from '../components/layout/MobileLayout'
import { BottomNav } from '../components/layout/BottomNav'
import { AppHeader } from '../components/layout/AppHeader'
import { Button } from '../components/ui/Button'
import { BottomSheet } from '../components/ui/BottomSheet'
import { TokenProductCard } from '../components/features/TokenProductCard'
import { useAppStore } from '../hooks/useAppStore'
import { TOKEN_PACKAGES } from '../config/tokenEconomyConfig'
import { TOKEN_REWARDS, EXAM_TOKEN_COST } from '../config/tokenConfig'
import { CASH_CONVERSION_UNIT, CASH_CONVERSION_FEE_RATE, computeConversion, getMaxConvertibleTokens } from '../config/tokenEconomyConfig'
import { getWallet, getMonthlyStats, getTransactions, purchaseTokens, convertTokensToCash } from '../services/tokenService'
import { mockRewardProvider } from '../services/payments/MockRewardProvider'
import { requestTokenPurchase } from '../services/paymentService'
import { saveUser } from '../services/authService'
import { formatDateFull } from '../utils/formatters'
import { StudentUser } from '../types'

export default function TokenPage() {
  const [searchParams] = useSearchParams()
  const { user, setUser } = useAppStore()
  const student = user as StudentUser

  const [showCharge, setShowCharge] = useState(searchParams.get('charge') === '1')
  const [showRequest, setShowRequest] = useState(searchParams.get('request') === '1')
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [requestSent, setRequestSent] = useState(false)

  const [wallet, setWallet] = useState(() => getWallet(student.id))
  const [showConvert, setShowConvert] = useState(false)
  const [convertState, setConvertState] = useState<'select' | 'loading' | 'done' | 'fail'>('select')
  const [convertAmount, setConvertAmount] = useState(() => getMaxConvertibleTokens(wallet.balance))
  const [convertedNet, setConvertedNet] = useState(0)

  const monthly = getMonthlyStats(student.id)
  const transactions = getTransactions(student.id).slice(0, 15)
  const product = TOKEN_PACKAGES.find((p) => p.id === selectedPkg)
  const maxConvertible = getMaxConvertibleTokens(wallet.balance)
  const conversionPreview = computeConversion(convertAmount)

  const refreshWallet = () => setWallet(getWallet(student.id))

  const openConvert = () => {
    setConvertAmount(getMaxConvertibleTokens(wallet.balance))
    setConvertState('select')
    setShowConvert(true)
  }
  const closeConvert = () => setShowConvert(false)

  const handleConfirmConvert = async () => {
    setConvertState('loading')
    const result = await mockRewardProvider.requestPayout(student.id, convertAmount)
    if (!result.success) {
      setConvertState('fail')
      return
    }
    // Provider 성공을 확인한 뒤에만 Token을 차감한다.
    const updated = convertTokensToCash(student.id, convertAmount, `현금 전환 ${convertAmount} TOKEN (KakaoPay)`)
    setWallet(updated)
    const updatedUser: StudentUser = { ...student, tokens: updated.balance }
    setUser(updatedUser)
    saveUser(updatedUser)
    setConvertedNet(computeConversion(convertAmount).netAmount)
    setConvertState('done')
  }

  const closeCharge = () => { setShowCharge(false); setSelectedPkg(null); setConfirming(false); setAgreed(false) }

  const handlePay = () => {
    if (!product) return
    const updated = purchaseTokens(student.id, product.tokens, `토큰 충전 ${product.label}`)
    const updatedUser: StudentUser = { ...student, tokens: updated.balance }
    setUser(updatedUser)
    saveUser(updatedUser)
    refreshWallet()
    closeCharge()
  }

  const handleRequestParent = () => {
    if (!product) return
    requestTokenPurchase(student, product.id)
    setRequestSent(true)
  }

  return (
    <MobileLayout>
      <AppHeader title="토큰" />

      <div className="flex-1 overflow-y-auto pb-24">
        <div className="mx-5 mt-2">
          <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-card p-6 text-white">
            <p className="text-sm opacity-80 mb-1">내 토큰</p>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-black">{wallet.balance}</span>
              <span className="text-xl mb-1">🪙</span>
            </div>
            <p className="text-xs opacity-80 mt-2">충전 {wallet.purchasedBalance} · 리워드 {wallet.rewardBalance}</p>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/20">
              <div>
                <p className="text-xs opacity-70">이번 달 획득</p>
                <p className="font-bold">+{monthly.earned}</p>
              </div>
              <div>
                <p className="text-xs opacity-70">이번 달 사용</p>
                <p className="font-bold">-{monthly.spent}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 mt-4">
          <div className="bg-white rounded-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <Wallet size={18} className="text-amber-500" />
              <h3 className="font-bold text-gray-900">카카오페이로 받을 수 있어요</h3>
            </div>
            <p className="text-xs text-gray-400 mb-3">보유 Token은 충전·리워드 구분 없이 {CASH_CONVERSION_UNIT}개 단위로 현금 전환할 수 있어요</p>
            {maxConvertible > 0 ? (
              <div className="bg-amber-50 rounded-2xl p-4 mb-4">
                <p className="text-sm font-bold text-gray-800 mb-2">{maxConvertible} TOKEN</p>
                <Row label="Token 가치" value={`₩${computeConversion(maxConvertible).grossAmount.toLocaleString()}`} />
                <Row label={`수수료 ${Math.round(CASH_CONVERSION_FEE_RATE * 100)}%`} value={`-₩${computeConversion(maxConvertible).feeAmount.toLocaleString()}`} muted />
                <div className="flex items-center justify-between mt-1 pt-2 border-t border-amber-100">
                  <span className="text-sm font-bold text-gray-900">실제 지급 예상</span>
                  <span className="text-lg font-black text-gray-900">₩{computeConversion(maxConvertible).netAmount.toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 mb-4">Token이 {CASH_CONVERSION_UNIT}개 이상 모이면 전환할 수 있어요 (현재 {wallet.balance}개)</p>
            )}
            <Button fullWidth variant="secondary" disabled={maxConvertible === 0} onClick={openConvert}>
              카카오페이로 받기
            </Button>
          </div>
        </div>

        <div className="px-5 mt-4">
          <div className="bg-white rounded-card p-4">
            <h3 className="font-bold text-gray-900 mb-3">토큰 이용 안내</h3>
            <div className="flex items-center gap-3 py-2">
              <span className="text-lg">📝</span>
              <span className="flex-1 text-sm text-gray-700">시험 응시 (문제 수·종류 무관)</span>
              <span className="font-bold text-red-400">-{EXAM_TOKEN_COST} 🪙</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-2">충전 Token부터 사용됩니다.</p>
          </div>
        </div>

        <div className="px-5 mt-4">
          <div className="bg-white rounded-card p-4">
            <h3 className="font-bold text-gray-900 mb-3">토큰 획득 방법</h3>
            <div className="space-y-2">
              {[
                { label: '90점 이상', reward: TOKEN_REWARDS.score_90_plus, icon: '🏆' },
                { label: '80~89점', reward: TOKEN_REWARDS.score_80_89, icon: '👍' },
                { label: '60~79점', reward: TOKEN_REWARDS.score_60_79, icon: '💪' },
                { label: '60점 미만', reward: TOKEN_REWARDS.score_below_60, icon: '🙂' },
                { label: '7일 연속 학습', reward: TOKEN_REWARDS.streak_7day, icon: '🔥' },
                { label: '30일 연속 학습', reward: TOKEN_REWARDS.streak_30day, icon: '🔥🔥' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <span className="text-lg">{item.icon}</span>
                  <span className="flex-1 text-sm text-gray-700">{item.label}</span>
                  <span className="font-bold text-green-500">+{item.reward} 🪙</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 mt-4">
          <div className="bg-white rounded-card p-4">
            <h3 className="font-bold text-gray-900 mb-3">토큰 사용 내역</h3>
            <div className="space-y-2">
              {transactions.length === 0 && <p className="text-sm text-gray-400 text-center py-4">아직 내역이 없어요</p>}
              {transactions.map((t) => (
                <div key={t.id} className="flex items-center gap-3 py-2">
                  {t.amount > 0 ? (
                    <ArrowUpCircle size={18} className="text-green-400 flex-shrink-0" />
                  ) : (
                    <ArrowDownCircle size={18} className="text-red-400 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{t.reason}</p>
                    <p className="text-xs text-gray-400">
                      {formatDateFull(t.createdAt)} · {t.tokenSource === 'PURCHASED' ? '충전' : '리워드'} · 잔액 {t.balanceAfter}🪙
                    </p>
                  </div>
                  <p className={`text-sm font-bold ${t.amount > 0 ? 'text-green-500' : 'text-red-400'}`}>
                    {t.amount > 0 ? '+' : ''}{t.amount}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[390px] px-5 pb-4 bg-gray-50">
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => { setShowRequest(true); setRequestSent(false); setSelectedPkg(null) }}>
            <Gift size={16} /> 보호자 요청
          </Button>
          <Button variant="primary" className="flex-1" onClick={() => setShowCharge(true)}>
            <Plus size={16} /> 충전하기
          </Button>
        </div>
      </div>

      <BottomNav />

      <BottomSheet open={showCharge} onClose={closeCharge} title={confirming ? '결제 확인' : '토큰 충전'}>
        {!confirming ? (
          <div className="space-y-3">
            {TOKEN_PACKAGES.map((pkg) => (
              <TokenProductCard
                key={pkg.id}
                label={pkg.label}
                tokens={pkg.tokens}
                bonus={0}
                price={pkg.price}
                best={'best' in pkg ? pkg.best : false}
                selected={selectedPkg === pkg.id}
                onClick={() => setSelectedPkg(pkg.id)}
              />
            ))}
            <div className="mt-2 p-3 bg-amber-50 rounded-2xl text-xs text-amber-700">
              ⚠️ 미성년자는 보호자 결제를 권장해요. 직접 결제 시 Mock 결제로 진행됩니다.
            </div>
            <Button fullWidth disabled={!selectedPkg} onClick={() => setConfirming(true)}>
              다음
            </Button>
          </div>
        ) : product ? (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
              <Row label="상품" value={product.label} />
              <Row label="가격" value={`${product.price.toLocaleString()}원`} />
              <Row label="결제수단" value="카드 **** 1234 (Mock)" />
            </div>
            <button onClick={() => setAgreed(!agreed)} className="w-full flex items-center gap-2 text-sm text-gray-600">
              <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${agreed ? 'bg-primary-500 border-primary-500' : 'border-gray-300'}`}>
                {agreed && <Check size={12} className="text-white" />}
              </span>
              결제 내용을 확인했습니다.
            </button>
            <Button fullWidth disabled={!agreed} onClick={handlePay}>
              ₩{product.price.toLocaleString()} 결제하기
            </Button>
          </div>
        ) : null}
      </BottomSheet>

      <BottomSheet open={showRequest} onClose={() => setShowRequest(false)} title="보호자에게 요청">
        {requestSent ? (
          <div className="text-center py-6">
            <p className="text-4xl mb-3">✅</p>
            <p className="font-bold text-gray-900 mb-1">요청을 보냈어요</p>
            <p className="text-sm text-gray-500">보호자가 승인하면 토큰이 지급돼요</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-primary-50 rounded-2xl p-4 text-center">
              <p className="text-3xl mb-2">👨‍👩‍👧</p>
              <p className="text-sm text-gray-600">보호자에게<br />토큰 충전을 요청해요</p>
            </div>
            <div className="space-y-2">
              {TOKEN_PACKAGES.map((pkg) => (
                <button
                  key={pkg.id}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl transition-colors ${selectedPkg === pkg.id ? 'bg-primary-50 border-2 border-primary-500' : 'bg-gray-50 border-2 border-transparent hover:bg-primary-50'}`}
                  onClick={() => setSelectedPkg(pkg.id)}
                >
                  <span className="font-semibold text-gray-800">🪙 {pkg.tokens} 토큰</span>
                  <span className="text-xs text-gray-400">{pkg.price.toLocaleString()}원</span>
                </button>
              ))}
            </div>
            <Button fullWidth disabled={!selectedPkg} onClick={handleRequestParent}>
              요청 보내기
            </Button>
            <p className="text-xs text-gray-400 text-center">보호자가 승인하면 결제 확인 후 지급됩니다</p>
          </div>
        )}
      </BottomSheet>

      <BottomSheet open={showConvert} onClose={closeConvert} title="몇 Token을 바꿀까요?">
        {convertState === 'select' && (
          <div className="space-y-5">
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={() => setConvertAmount((a) => Math.max(CASH_CONVERSION_UNIT, a - CASH_CONVERSION_UNIT))}
                disabled={convertAmount <= CASH_CONVERSION_UNIT}
                className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 disabled:opacity-30"
              >
                <Minus size={18} />
              </button>
              <span className="text-3xl font-black text-gray-900 w-24 text-center">{convertAmount}</span>
              <button
                onClick={() => setConvertAmount((a) => Math.min(maxConvertible, a + CASH_CONVERSION_UNIT))}
                disabled={convertAmount >= maxConvertible}
                className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 disabled:opacity-30"
              >
                <Plus size={18} />
              </button>
            </div>
            <button onClick={() => setConvertAmount(maxConvertible)} className="w-full text-center text-xs font-bold text-primary-500">
              MAX ({maxConvertible} TOKEN)
            </button>
            <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
              <Row label="Token 가치" value={`₩${conversionPreview.grossAmount.toLocaleString()}`} />
              <Row label={`수수료 ${Math.round(CASH_CONVERSION_FEE_RATE * 100)}%`} value={`-₩${conversionPreview.feeAmount.toLocaleString()}`} muted />
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span className="text-sm font-bold text-gray-900">받는 금액</span>
                <span className="text-lg font-black text-gray-900">₩{conversionPreview.netAmount.toLocaleString()}</span>
              </div>
            </div>
            <Button fullWidth onClick={handleConfirmConvert}>
              ₩{conversionPreview.netAmount.toLocaleString()} 받기
            </Button>
          </div>
        )}
        {convertState === 'loading' && (
          <div className="py-10 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500">지급을 처리하고 있어요...</p>
          </div>
        )}
        {convertState === 'done' && (
          <div className="py-6 text-center">
            <p className="text-4xl mb-3">✅</p>
            <p className="font-bold text-gray-900 mb-1">카카오페이 지급 완료</p>
            <p className="text-3xl font-black text-gray-900 mt-3">₩{convertedNet.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-3">사용 Token {convertAmount}</p>
            <p className="text-xs text-gray-400">
              남은 Token 충전 {wallet.purchasedBalance} + 리워드 {wallet.rewardBalance} = 총 {wallet.balance} TOKEN
            </p>
            <Button fullWidth className="mt-6" onClick={closeConvert}>
              확인
            </Button>
          </div>
        )}
        {convertState === 'fail' && (
          <div className="py-6 text-center">
            <p className="text-4xl mb-3">⚠️</p>
            <p className="font-bold text-gray-900 mb-1">지급에 실패했어요.</p>
            <p className="text-sm text-gray-500">Token은 차감되지 않았습니다.</p>
            <Button fullWidth className="mt-6" onClick={() => setConvertState('select')}>
              다시 시도
            </Button>
          </div>
        )}
      </BottomSheet>
    </MobileLayout>
  )
}

function Row({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-bold ${muted ? 'text-red-400' : 'text-gray-900'}`}>{value}</span>
    </div>
  )
}
